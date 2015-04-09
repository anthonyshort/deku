
/**
 * Dependencies.
 */

var Interactions = require('./interactions');
var shallowCopy = require('shallow-copy');
var virtualize = require('virtualize');
var virtualize = require('../../virtualize');
var each = require('component-each');
var assign = require('extend');
var Pool = require('dom-pool');
var walk = require('dom-walk');
var zip = require('array-zip');
var raf = require('component-raf');
var isDom = require('is-dom');
var uid = require('get-uid');
var tree = virtualize.tree;

/**
 * Prevent calling setState in these lifecycle states
 *
 * @type {Object}
 */

var preventSetState = {
  beforeUpdate: "You can't call setState in the beforeUpdate hook. Use the propsChanged hook instead.",
  render: "You can't call setState in the render hook. This method must remain pure."
};

/**
 * Expose `dom`.
 */

module.exports = dom;

/**
 * Let the app render components to the DOM.
 *
 * @param {World} app
 * @return {Function} teardown
 */

function dom(app) {
  setup();

  /**
   * Setup dom render.
   */

  function setup() {
    app.events = new Interactions(document.body);
    app.entities = {};
    app.pools = {};
    app.on('unmount component', onunmount);
    app.on('mount component', onmount);
    app.on('update component', onupdate);
  }

  /**
   * Teardown dom rendering.
   */

  function teardown() {
    app.off('unmount component', onunmount);
    app.off('mount component', onmount);
    app.off('update component', update);
  }

  function onmount(data) {
    init(data.path, data.component, data.properties, data.element);
  }

  function onunmount(data) {
    remove(data.path);
  }

  function onupdate(data) {
    var properties = data.properties;
    var path = data.path;
    if ('0' === path) {
      var entity = app.root;
      entity.pendingProps = assign(entity.pendingProps, properties);
      entity.dirty = true;
      invalidate();
    }
  }

  function init(path, component, properties, container) {
    // TODO: for now, since we can only have 1 root element,
    // this is hardcoded to 1 root.
    // this is currently just decoupling app module from entity,
    // initial first step
    app.root = new Entity(component, properties);
    var el = mount(app.root);
    container.appendChild(el);
  }

  /**
   * Render and mount a component to the native dom.
   *
   * @param {Entity} entity
   * @return {HTMLElement}
   */

  function mount(entity) {
    entity.children = {};
    app.entities[entity.id] = entity;

    // commit initial state and props.
    commit(entity);

    // callback before mounting.
    trigger('beforeMount', entity, [
      entity.props,
      entity.state
    ]);

    // render virtual element.
    var virtualElement = renderEntity(entity);
    // create native element.
    var nativeElement = toNative(entity.id, '0', virtualElement);

    entity.virtualElement = virtualElement;
    entity.nativeElement = nativeElement;

    updateEvents(entity);

    // callback after mounting.
    trigger('afterMount', entity, [
      nativeElement,
      entity.props,
      entity.state
    ]);

    return nativeElement;
  }

  /**
   * Remove a component from the native dom.
   *
   * @param {Entity} entity
   */

  function unmount(entity) {
    var el = entity.nativeElement;
    if (!el) return;
    unmountChildren(entity);
    trigger('beforeUnmount', entity, [
      el,
      entity.props,
      entity.state
    ]);
    removeEvents(entity);
    delete app.entities[entity.id];
  }

  /**
   * Render the entity and make sure it returns a node
   *
   * @param {Entity} entity
   *
   * @return {VirtualTree}
   */

  function renderEntity(entity) {
    var component = entity.component;
    entity.lifecycle = 'render';
    var result = component.render(entity.props, entity.state, send);
    if (!result) result = virtualize.node('noscript');
    entity.lifecycle = null;
    return result;

    // Whenever setState or setProps is called, we mark the entity
    // as dirty in the renderer. This lets us optimize the re-rendering
    // and skip components that definitely haven't changed.
    function send(nextState) {
      checkSetState(entity.lifecycle);
      entity.pendingState = assign(entity.pendingState, nextState);
      entity.dirty = true;
      invalidate();
    }
  }

  /**
   * Tell the app it's dirty and needs to re-render.
   */

  function invalidate() {
    if (app.options.renderImmediate) {
      render();
    } else {
      if (!frameId) frameId = raf(render);
    }
  }

  /**
   * Update the DOM. If the update fails we stop the loop
   * so we don't get errors on every frame.
   *
   * @api public
   */

  var frameId;
  var isRendering;
  function render() {

    // If this is called synchronously we need to
    // cancel any pending future updates
    if (frameId) raf.cancel(frameId);

    // If the rendering from the previous frame is still going,
    // we'll just wait until the next frame. Ideally renders should
    // not take over 16ms to stay within a single frame, but this should
    // catch it if it does.
    if (isRendering) {
      frameId = raf(render);
      return;
    }

    isRendering = true;
    frameId = 0;
    update(app.root.id);
    isRendering = false;
  }

  /**
   * Update a component.
   *
   * The entity is just the data object for a component instance.
   *
   * @param {String} id Component instance id.
   */

  function update(id) {
    var entity = app.entities[id];
    if (!shouldUpdate(entity)) return updateChildren(id);

    var currentTree = entity.virtualElement;
    var nextProps = entity.pendingProps;
    var nextState = entity.pendingState;
    var el = entity.nativeElement;
    var previousState = entity.state;
    var previousProps = entity.props;

    // hook before rendering. could modify state just before the render occurs.
    trigger('beforeUpdate', entity, [
      previousProps,
      previousState,
      nextProps,
      nextState
    ]);

    // commit state and props.
    commit(entity);

    // re-render.
    var nextTree = renderEntity(entity);

    // apply new virtual tree to native dom.
    patch(entity, currentTree, nextTree, el);
    entity.virtualElement = nextTree;
    updateEvents(entity);
    updateChildren(id);
    var currentProps = entity.props;
    var currentState = entity.state;

    // trigger afterUpdate after all children have updated.
    trigger('afterUpdate', entity, [
      currentProps,
      currentState,
      previousProps,
      previousState
    ]);
  }

  /**
   * Updates all the DOM event bindings for an entity.
   *
   * @param {Entity} entity
   */

  function updateEvents(entity) {
    app.events.unbind(entity.id);
    var nodes = tree(entity.virtualElement).nodes;

    // TODO: Optimize this by storing the events in the Tree
    // object on the initial pass instead of looping again.
    // eg. entity.current.events -> '0.0.1:click': fn
    each(nodes, function(path, node){
      if (node.type !== 'element') return;
      each(node.events, function(eventType, fn){
        app.events.bind(entity.id, path, eventType, function(e){
          fn.call(entity.component, e, entity.props, entity.state);
        });
      });
    });
  }

  /**
   * Update all the children of an entity.
   *
   * @param {String} id Component instance id.
   */

  function updateChildren(id) {
    var children = app.entities[id].children;
    for (var path in children) {
      var childId = children[path];
      update(childId);
    }
  }

  /**
   * Clear the app
   */

  function remove() {
    if (!app) return;

    // If this is called synchronously we need to
    // cancel any pending future updates
    if (frameId) {
      raf.cancel(frameId);
      frameId = 0;
    }

    // Unmount the root component and take the
    // element with it.
    var el = app.root.nativeElement;
    var id = app.root.id;
    removeElement(id, '0', el);
    unmount(app.root);

    // Unbind all the delegated events.
    app.events.remove();

    // Empty the pools so that our elements don't
    // stay in memory accidentally.
    app.pools = {};
    app = null;
  }

  /**
   * Unbind all events from an entity
   *
   * @param {Entity} entity
   */

  function removeEvents(entity) {
    app.events.unbind(entity.id);
  }

  /**
   * Remove all of the child entities of an entity
   *
   * @param {Entity} entity
   */

  function unmountChildren(entity) {
    var entities = app.entities;
    var children = entity.children;
    for (var path in children) {
      var childId = children[path];
      unmount(entities[childId]);
    }
  }

  /**
   * Create a native element from a virtual element.
   *
   * @param {String} entityId
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {HTMLDocumentFragment}
   */

  function toNative(entityId, path, vnode) {
    var entity = app.entities[entityId];

    switch (vnode.type) {
      case 'text': return toNativeText(vnode);
      case 'element': return toNativeElement(entity, path, vnode);
      case 'component': return toNativeComponent(entity, path, vnode);
    }
  }

  /**
   * Create a native text element from a virtual element.
   *
   * @param {Object} vnode
   */

  function toNativeText(vnode) {
    return document.createTextNode(vnode.data);
  }

  /**
   * Create a native element from a virtual element.
   */

  function toNativeElement(entity, path, vnode) {
    var disablePooling = entity.options.disablePooling;
    var attributes = vnode.attributes;
    var children = vnode.children;
    var tagName = vnode.tagName;
    var entityId = entity.id;

    // create element either from pool or fresh.
    if (disablePooling) {
      var el = document.createElement(tagName);
    } else {
      var pool = getPool(tagName);
      var el = cleanup(pool.pop());
      if (el.parentNode) el.parentNode.removeChild(el);
    }

    // set attributes.
    for (var name in attributes) setAttribute(el, name, attributes[name]);

    // store keys on the native element for fast event handling.
    el.__entity__ = entityId;
    el.__path__ = path;

    // add children.
    children.forEach(function(child, i){
      var childEl = toNative(entityId, path + '.' + i, child);
      if (!childEl.parentNode) el.appendChild(childEl);
    });

    return el;
  }

  /**
   * Create a native element from a component.
   */

  function toNativeComponent(entity, path, vnode) {
    var entityId = entity.id;
    var child = new Entity(vnode.component, vnode.props);
    entity.children[path] = child.id;
    return mount(child);
  }

  /**
   * Patch an element with the diff from two trees.
   */

  function patch(entity, prev, next, el) {
    diffNode('0', entity, prev, next, el);
  }

  /**
   * Create a diff between two tress of nodes.
   */

   function diffNode(path, entity, prev, next, el) {
    // Type changed. This could be from element->text, text->ComponentA,
    // ComponentA->ComponentB etc. But NOT div->span. These are the same type
    // (ElementNode) but different tag name.
    if (prev.type !== next.type) return replaceElement(entity, path, el, next);

    switch (next.type) {
      case 'text': return diffText(prev, next, el);
      case 'element': return diffElement(path, entity, prev, next, el);
      case 'component': return diffComponent(path, entity, prev, next, el);
    }
  }

  /**
   * Diff two text nodes and update the element.
   */

  function diffText(previous, current, el) {
    if (current.data !== previous.data) el.data = current.data;
  }

  /**
   * Diff the children of an ElementNode.
   */

  function diffChildren(path, entity, prev, next, el) {
    var children = zip(prev.children, next.children);

    // TODO:
    // Order the children using the key attribute in
    // both arrays of children and compare them first, then
    // the other nodes that have been added or removed, then
    // render them in the correct order

    var j = -1;
    for (var i = 0; i < children.length; i++) {
      j += 1;
      var item = children[i];
      var left = item[0];
      var right = item[1];
      var childPath = path + '.' + j;

      // this is a new node.
      if (left == null) {
        var childEl = toNative(entity.id, childPath, right);
        el.appendChild(childEl);
        continue;
      }

      // the node has been removed.
      if (right == null) {
        removeElement(entity.id, childPath, el.childNodes[j])
        j = j - 1;
        continue;
      }

      diffNode(childPath, entity, left, right, el.childNodes[j]);
    }
  }

  /**
   * Diff the attributes and add/remove them.
   */

  function diffAttributes(prev, next, el) {
    var nextAttrs = next.attributes;
    var prevAttrs = prev.attributes;

    // add new attrs
    for (var name in nextAttrs) {
      var value = nextAttrs[name];
      if (!prevAttrs[name] || prevAttrs[name] !== value) {
        setAttribute(el, name, value);
      }
    }

    // remove old attrs
    for (var oldName in prevAttrs) {
      if (!nextAttrs[oldName]) {
        el.removeAttribute(oldName);
      }
    }
  }

  /**
   * Update a component with the props from the next node. If
   * the component type has changed, we'll just remove the old one
   * and replace it with the new component.
   */

  function diffComponent(path, entity, prev, next, el) {
    if (next.component !== prev.component) {
      replaceElement(entity, path, el, next);
    } else {
      updateEntity(entity, path, next);
    }
  }

  /**
   * Diff two element nodes.
   */

  function diffElement(path, entity, prev, next, el) {
    // different node, so swap them. If the root node of the component has changed it's
    // type we need to update this to point to this new element
    if (next.tagName !== prev.tagName) return replaceElement(entity, path, el, next);
    diffAttributes(prev, next, el);
    diffChildren(path, entity, prev, next, el);
  }

  /**
   * Removes an element from the DOM and unmounts and components
   * that are within that branch
   *
   * side effects:
   *   - removes element from the DOM
   *   - removes internal references
   *
   * @param {String} entityId
   * @param {String} path
   * @param {HTMLElement} el
   */

  function removeElement(entityId, path, el) {
    var children = app.entities[entityId].children;
    var entities = shallowCopy(app.entities);
    var entity = entities[entityId];

    // If the path points to a component we should use that
    // components element instead, because it might have moved it.
    if (children[path]) {
      var childId = children[path];
      var child = entities[childId];
      el = child.nativeElement;
      unmount(child);
      delete children[path];
    } else {
      // Just remove the text node
      if (!isElement(el)) return el.parentNode.removeChild(el);

      // Then we need to find any components within this
      // branch and unmount them.
      for (var childPath in children) {
        if (childPath === path || isWithinPath(path, childPath)) {
          unmount(entities[children[childPath]]);
          delete children[childPath];
        }
      }
    }

    // Return all of the elements in this node tree to the pool
    // so that the elements can be re-used.
    walk(el, function(node){
      if (!isElement(node)) return;
      var parent = entities[node.__entity__];
      if (!parent || parent.options.disablePooling) return;
      getPool(node.tagName.toLowerCase()).push(node);
    });

    // Remove it from the DOM
    el.parentNode.removeChild(el);
  }

  /**
   * Replace an element in the DOM. Removing all components
   * within that element and re-rendering the new virtual node.
   *
   * @param {Entity} entity
   * @param {String} path
   * @param {HTMLElement} el
   * @param {Object} vnode
   *
   * @return {void}
   */

  function replaceElement(entity, path, el, vnode) {
    var entityId = entity.id;
    var parent = el.parentNode;
    var index = Array.prototype.indexOf.call(parent.childNodes, el);
    var entities = app.entities;

    // remove the previous element and all nested components. This
    // needs to happen before we create the new element so we don't
    // get clashes on the component paths.
    removeElement(entityId, path, el);

    // then add the new element in there
    var newEl = toNative(entityId, path, vnode);
    var target = parent.childNodes[index];

    if (target) {
      parent.insertBefore(newEl, target);
    } else {
      parent.appendChild(newEl);
    }

    // update all `entity.nativeElement` references.
    for (var id in entities) {
      var entity = entities[id];
      if (entity.nativeElement === el) {
        entity.nativeElement = newEl;
      }
    }
  }

  /**
   * Update an entity to match the latest rendered vode. We always
   * replace the props on the component when composing them. This
   * will trigger a re-render on all children below this point.
   *
   * @param {Entity} entity
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {void}
   */

  function updateEntity(entity, path, vnode) {
    var childId = entity.children[path];
    var entity = app.entities[childId];
    entity.pendingProps = vnode.props;
    entity.dirty = true;
    invalidate();
  }

  /**
   * Set the attribute of an element, performing additional transformations
   * dependning on the attribute name
   *
   * @param {HTMLElement} el
   * @param {String} name
   * @param {String} value
   */

  function setAttribute(el, name, value) {
    switch (name) {
      case 'value':
        el.value = value;
        break;
      case 'innerHTML':
        el.innerHTML = value;
        break;
      default:
        el.setAttribute(name, value);
        break;
    }
  }

  /**
   * Checks to see if one tree path is within
   * another tree path. Example:
   *
   * 0.1 vs 0.1.1 = true
   * 0.2 vs 0.3.5 = false
   *
   * @param {String} target
   * @param {String} path
   *
   * @return {Boolean}
   */

  function isWithinPath(target, path) {
    return path.indexOf(target + '.') === 0;
  }

  /**
   * Is the DOM node an element node
   *
   * @param {HTMLElement} el
   *
   * @return {Boolean}
   */

  function isElement(el) {
    return !!el.tagName;
  }

  /**
   * Get the pool for a tagName, creating it if it
   * doesn't exist.
   *
   * @param {String} tagName
   *
   * @return {Pool}
   */

  function getPool(tagName) {
    var pool = app.pools[tagName];
    if (!pool) pool = app.pools[tagName] = new Pool({ tagName: tagName });
    return pool;
  }

  /**
   * Clean up previously used native element for reuse.
   *
   * @param {HTMLElement} el
   */

  function cleanup(el) {
    removeAllChildren(el);
    removeAllAttributes(el);
    return el;
  }

  /**
   * Remove all the attributes from a node
   *
   * @param {HTMLElement} el
   */

  function removeAllAttributes(el) {
    for (var i = el.attributes.length - 1; i >= 0; i--) {
      var name = el.attributes[i].name;
      el.removeAttribute(name);
    }
  }

  /**
   * Remove all the child nodes from an element
   *
   * @param {HTMLElement} el
   */

  function removeAllChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  /**
   * Trigger a hook on a component.
   *
   * @param {String} name Name of hook.
   * @param {Entity} entity The component instance.
   * @param {Array} args To pass along to hook.
   */

  function trigger(name, entity, args) {
    entity.lifecycle = name;
    if (typeof entity.component[name] === 'function') {
      args.push(send); // last arg is `send`
      entity.component[name].apply(null, args);
    }
    entity.lifecycle = null;

    /**
     * Function for hook to set state if desired.
     *
     * @param {Object} nextState
     */

    function send(nextState) {
      checkSetState(entity.lifecycle);
      entity.pendingState = assign(entity.pendingState, nextState);
      entity.dirty = true;
      invalidate();
    }
  }

  /**
   * Determine whether it is possible to set state during a
   * lifecycle method.
   *
   * @param {String} lifecycle
   */

  function checkSetState(lifecycle) {
    var message = preventSetState[lifecycle];
    if (message) throw new Error(message);
  }

  /**
   * Commit props and state changes to an entity.
   */

  function commit(entity) {
    entity.state = entity.pendingState;
    entity.props = entity.pendingProps;
    entity.pendingState = assign({}, entity.state);
    entity.pendingProps = assign({}, entity.props);
    entity.dirty = false;
  }

  /**
   * Try to avoid creating new virtual dom if possible.
   *
   * Later we may expose this so you can override, but not there yet.
   */

  function shouldUpdate(entity) {
    if (!entity.dirty) return false;
    var nextProps = entity.pendingProps;
    var nextState = entity.pendingState;
    var component = entity.component;
    var prevProps = entity.props;
    var prevState = entity.state;
    var bool = component.shouldUpdate(prevProps, prevState, nextProps, nextState);
    return bool;
  };

  return teardown;
};

/**
 * A rendered component instance.
 *
 * This manages the lifecycle, props and state of the component.
 * It's basically just a data object for more straightfoward lookup.
 *
 * @param {Component} component
 * @param {Object} props
 */

function Entity(component, props) {
  this.id = uid();
  this.options = component.options;
  this.props = props || {};
  this.component = component;
  this.state = this.component.initialState(this.props);
  this.lifecycle = null;
  this.pendingProps = assign({}, this.props);
  this.pendingState = assign({}, this.state);
  this.dirty = false;
  this.virtualElement = null;
  this.nativeElement = null;
}
