
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
 * Let the world render components to the DOM.
 *
 * @param {World} world
 * @return {Function} teardown
 */

function dom(world) {
  setup();

  /**
   * Setup dom render.
   */

  function setup() {
    world.events = new Interactions(document.body);
    world.entities = {};
    world.elements = {};
    world.renders = {};
    world.children = {};
    world.pools = {};
    world.on('unmount component', onunmount);
    world.on('mount component', onmount);
    world.on('update component', onupdate);
  }

  /**
   * Teardown dom rendering.
   */

  function teardown() {
    world.off('unmount component', onunmount);
    world.off('mount component', onmount);
    world.off('update component', update);
  }

  function onmount(data) {
    init(data.path, data.component, data.properties, data.element);
  }

  function onunmount(data) {
    destroy(data.path);
  }

  function onupdate(data) {
    var properties = data.properties;
    var path = data.path;
    if ('0' === path) {
      var entity = world.root;
      entity._pendingProps = assign(entity._pendingProps, properties);
      trigger('propsChanged', entity, [entity._pendingProps, entity.props, entity.state]);
      entity.dirty = true;
      invalidate();
    }
  }

  function init(path, component, properties, container) {
    // TODO: for now, since we can only have 1 root element,
    // this is hardcoded to 1 root.
    // this is currently just decoupling world module from entity,
    // initial first step
    world.root = new Entity(component, properties);
    var el = mount(world.root);
    container.appendChild(el);
  }

  function destroy(path) {
    renderer.remove();
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
    update(world.root);
    isRendering = false;
  }

  /**
   * Update an entity already on the world.
   *
   * @param {Entity} entity
   *
   * @api private
   * @return {void}
   */

  function update(entity) {
    // Recursive update
    function next(){
      updateChildren(entity);
    }

    // If setState or setProps have been called we can
    // allow a user-defined check to see if we should update the
    // component. This returns true by default. This allows the user
    // improve the overall performance of their app and avoids hard
    // to track down bugs. We essentially are trading a bit of
    // performance here for user-experience.
    if (!shouldUpdate(entity)) return next();

    // TODO: We really want to just use a different object here
    // whenever the props/state changes so we can just do an equality
    // check to know if we've changed.
    var nextProps = entity._pendingProps;
    var nextState = entity._pendingState;
    var previousState = entity.state;
    var previousProps = entity.props;
    var currentTree = world.renders[entity.id];
    var currentEl = world.elements[entity.id];

    // pre-update. This callback could mutate the
    // state or props just before the render occurs
    trigger('beforeUpdate', entity, [previousProps, previousState, nextProps, nextState]);

    // Now we can commit the state of the entity. All of the
    // pending props and state will now be committed and reflect
    // the actual state of the component.
    commit(entity);

    // Re-render the tree to get an up-to-date representation
    // of the component with the new props/state
    var nextTree = renderEntity(entity);

    // Run the diff and patch the element.
    patch({
      entity: entity,
      current: currentTree,
      next: nextTree,
      el: currentEl
    });

    // Update the element for this component in case
    // the root node has changed.
    world.renders[entity.id] = nextTree;
    updateEvents(entity);
    next();
    trigger('afterUpdate', entity, [entity.props, entity.state, previousProps, previousState]);
  };

  /**
   * Update all the children of an entity
   */

  function updateChildren(entity) {
    var entities = world.entities;
    var children = world.children[entity.id];
    for (var path in children) {
      var childId = children[path];
      update(entities[childId]);
    }
  };

  /**
   * Clear the world
   */

  function remove() {
    if (!world) return;

    // If this is called synchronously we need to
    // cancel any pending future updates
    if (frameId) {
      raf.cancel(frameId);
      frameId = 0;
    }

    // Unmount the root component and take the
    // element with it.
    var id = world.root.id;
    removeElement(id, '0', world.elements[id]);
    unmount(world.root);

    // Unbind all the delegated events.
    world.events.remove();

    // Empty the pools so that our elements don't
    // stay in memory accidentally.
    world.pools = {};
    world = null;
  };

  /**
   * Append an entity to an element
   *
   * @param {Entity} entity
   *
   * @return {HTMLElement}
   */

  function mount(entity) {
    commit(entity);
    trigger('beforeMount', entity, [entity.props, entity.state]);

    // This will store all the entities that are children
    // of this entity after it is rendered and mounted.
    world.children[entity.id] = {};
    world.entities[entity.id] = entity;

    // Render the entity and create the initial element for it
    var current = renderEntity(entity);
    var el = toNative(entity.id, '0', current);

    // We store the DOM state of the entity within the renderer
    world.elements[entity.id] = el;
    world.renders[entity.id] = current;

    updateEvents(entity);
    trigger('afterMount', entity, [el, entity.props, entity.state]);
    return el;
  }

  function invalidate() {
    if (world.options.renderImmediate) {
      render();
    } else {
      if (!frameId) frameId = raf(render);
    }
  }

  /**
   * Remove the entity from the DOM.
   *
   * @param {Entity} entity
   */

  function unmount(entity) {
    var el = world.elements[entity.id];
    if (!el) return;
    unmountChildren(entity);
    trigger('beforeUnmount', entity, [el, entity.props, entity.state]);
    removeEvents(entity);
    delete world.elements[entity.id];
    delete world.renders[entity.id];
    delete world.entities[entity.id];
    delete world.children[entity.id];
  }

  /**
   * Remove all of the child entities of an entity
   *
   * @param {Entity} entity
   */

  function unmountChildren(entity) {
    var entities = world.entities;
    var children = world.children[entity.id];
    each(children, function(path, childId){
      unmount(entities[childId]);
    });
  }

  /**
   * Updates all the DOM event bindings for an entity.
   * It removes all event bindings on the world for this entity
   * first and just reapplies them using the current tree.
   *
   * @return {void}
   */

  function updateEvents(entity) {
    world.events.unbind(entity.id);
    var nodes = tree(world.renders[entity.id]).nodes;

    // TODO: Optimize this by storing the events in the Tree
    // object on the initial pass instead of looping again.
    // eg. entity.current.events -> '0.0.1:click': fn
    each(nodes, function(path, node){
      if (node.type !== 'element') return;
      each(node.events, function(eventType, fn){
        world.events.bind(entity.id, path, eventType, function(e){
          fn.call(entity.component, e, entity.props, entity.state);
        });
      });
    });
  }

  /**
   * Unbind all events from an entity
   *
   * @param {Entity} entity
   */

  function removeEvents(entity) {
    world.events.unbind(entity.id);
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
    var pool = world.pools[tagName];
    if (!pool) {
      pool = world.pools[tagName] = new Pool({ tagName: tagName });
    }
    return pool;
  }

  /**
   * Convert this node and all it's children into
   * real DOM elements and return it.
   *
   * Passing in a node allows us to render just a small
   * part of the tree instead of the whole thing, like when
   * a new branch is added during a diff.
   *
   * @param {Node} node
   * @param {String} path
   * @param {String} entityId
   *
   * @return {HTMLDocumentFragment}
   */

  function toNative(entityId, path, vnode) {
    var entity = world.entities[entityId];

    switch (vnode.type) {
      case 'text': return toNativeText(vnode);
      case 'element': return toNativeElement(entity, path, vnode);
      case 'component': return toNativeComponent(entity, path, vnode);
    }
  }

  function toNativeText(vnode) {
    return document.createTextNode(vnode.data);
  }

  function toNativeElement(entity, path, vnode) {
    var children = vnode.children;
    var tagName = vnode.tagName;
    var entityId = entity.id;
    var el;

    // Get the element from the pool if we can
    if (entity.options.disablePooling) {
      el = document.createElement(tagName);
    } else {
      var pool = getPool(tagName);
      el = pool.pop();
      removeAllChildren(el);
      removeAllAttributes(el);
      if (el.parentNode) el.parentNode.removeChild(el);
    }

    // TODO: These is some duplication here between the diffing.
    // This should be generalized and put into a module somewhere
    // so that it's easier to define special attributes in one spot.
    for (var name in vnode.attributes) {
      setAttribute(el, name, vnode.attributes[name]);
    }

    // TODO: Store nodes in a hash so we can easily find
    // elements later. This would allow us to separate out the
    // patching from the diffing will still being efficient. We could
    // also use the same object in the Interactions object to make
    // lookups cleaner instead of checking __ values.
    // this.elementsByPath[entity.id][path] = el;
    el.__path__ = path;
    el.__entity__ = entityId;

    // add children.
    for (var i = 0, n = children.length; i < n; i++) {
      var childEl = toNative(entityId, path + '.' + i, children[i]);
      if (!childEl.parentNode) el.appendChild(childEl);
    }

    return el;
  }

  function toNativeComponent(entity, path, vnode) {
    var entityId = entity.id;
    var child = new Entity(vnode.component, vnode.props);
    world.children[entityId][path] = child.id;
    return mount(child);
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
    var children = world.children[entityId];
    var entities = shallowCopy(world.entities);
    var entity = entities[entityId];

    // If the path points to a component we should use that
    // components element instead, because it might have moved it.
    if (children[path]) {
      var child = world.entities[children[path]];
      el = world.elements[child.id];
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
   * @param {String} entityId
   * @param {String} path
   * @param {HTMLElement} el
   * @param {Object} vnode
   *
   * @return {void}
   */

  function replaceElement(entityId, path, el, vnode) {
    var parent = el.parentNode;
    var index = Array.prototype.indexOf.call(parent.childNodes, el);

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

    // Make sure any component that was referencing the old
    // element as it's element is now referencing the new one.
    for (var id in world.elements) {
      if (world.elements[id] === el) {
        world.elements[id] = newEl;
      }
    }
  }

  /**
   * Update an entity to match the latest rendered vode. We always
   * replace the props on the component when composing them. This
   * will trigger a re-render on all children below this point.
   *
   * @param {String} entityId
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {void}
   */

  function updateEntity(entityId, path, vnode) {
    var childId = world.children[entityId][path];
    var entity = world.entities[childId];
    entity._pendingProps = vnode.props;
    trigger('propsChanged', entity, [entity._pendingProps, entity.props, entity.state]);
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
    if (name === "value") {
      el.value = value;
    } else if (name === "innerHTML") {
      el.innerHTML = value;
    } else {
      el.setAttribute(name, value);
    }
  }

  /**
   * Render the entity and make sure it returns a node
   *
   * @param {Entity} entity
   *
   * @return {VirtualTree}
   */

  function renderEntity(entity) {
    entity.lifecycle = 'render';
    var result = entity.component.render(entity.props, entity.state, send);
    if (!result) result = virtualize.node('noscript');
    entity.lifecycle = null;
    return result;

    // Whenever setState or setProps is called, we mark the entity
    // as dirty in the renderer. This lets us optimize the re-rendering
    // and skip components that definitely haven't changed.
    function send(nextState) {
      checkSetState(entity.lifecycle);
      entity._pendingState = assign(entity._pendingState, nextState);
      entity.dirty = true;
      invalidate();
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
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  /**
   * Patch an element with the diff from two trees
   *
   * @param {object} options
   */

  function patch(options){
    diffNode(options.current, options.next, {
      el: options.el,
      entity: options.entity,
      path: '0'
    });
  }

  /**
   * Create a diff between two tress of nodes.
   */

   function diffNode(current, next, context){
    // Type changed. This could be from element->text, text->ComponentA,
    // ComponentA->ComponentB etc. But NOT div->span. These are the same type
    // (ElementNode) but different tag name.
    if (current.type !== next.type) {
      return replaceElement(context.entity.id, context.path, context.el, next);
    }

    // update the text content.
    if (next.type === 'text') {
      return diffText(current, next, context);
    }

    // update nested components.
    if (next.type === 'component') {
      return diffComponent(current, next, context);
    }

    // if they are both elements.
    if (next.type === 'element') {
      return diffElement(current, next, context);
    }
  }

  /**
   * Diff two text nodes and update the element.
   *
   * @param {Node} previous
   * @param {Node} current
   * @param {TextElement} el
   */

  function diffText(previous, current, context){
    if (current.data !== previous.data) {
      context.el.data = current.data;
    }
  }

  /**
   * Diff the children of an ElementNode.
   *
   * @param {ComponentRenderer} this
   * @param {Node} previous
   * @param {Node} current
   * @param {Element} el
   */

  function diffChildren(previous, current, context){
    var children = zip(previous.children, current.children);
    var el = context.el;

    var j = -1;
    for (var i = 0; i < children.length; i++) {
      j += 1;
      var item = children[i];
      var left = item[0];
      var right = item[1];
      var childPath = context.path + '.' + j;

      // this is a new node.
      if (left == null) {
        var childEl = toNative(context.entity.id, childPath, right) ;
        el.appendChild(childEl);
        continue;
      }

      // the node has been removed.
      if (right == null) {
        removeElement(context.entity.id, childPath, el.childNodes[j])
        j = j - 1;
        continue;
      }

      diffNode(left, right, {
        el: el.childNodes[j],
        entity: context.entity,
        path: childPath
      });
    }
  }

  /**
   * Diff the attributes and add/remove them.
   *
   * @param {ComponentRenderer} this
   * @param {Node} previous
   * @param {Node} current
   * @param {Element} el
   */

  function diffAttributes(previous, current, context){
    var currentAttrs = current.attributes;
    var previousAttrs = previous.attributes;

    // add new attrs
    for (var name in currentAttrs) {
      var value = currentAttrs[name];
      if (!previousAttrs[name] || previousAttrs[name] !== value) {
        setAttribute(context.el, name, value);
      }
    }

    // remove old attrs
    for (var oldName in previousAttrs) {
      if (!currentAttrs[oldName]) {
        context.el.removeAttribute(oldName);
      }
    }
  }

  /**
   * Update a component with the props from the current node. If
   * the component type has changed, we'll just remove the old one
   * and replace it with the new component.
   *
   * @param {Node} previous
   * @param {Node} current
   * @param {Object} context
   */

  function diffComponent(previous, current, context){
    if (current.component !== previous.component) {
      replaceElement(context.entity.id, context.path, context.el, current);
    } else {
      updateEntity(context.entity.id, context.path, current);
    }
  }

  /**
   * Diff two element nodes.
   *
   * @param {ComponentRenderer} this
   * @param {Node} previous
   * @param {Node} current
   * @param {Element} el
   */

  function diffElement(previous, current, context){
    // different node, so swap them. If the root node of the component has changed it's
    // type we need to update this to point to this new element
    if (current.tagName !== previous.tagName) {
      return replaceElement(context.entity.id, context.path, context.el, current);
    }

    // TODO:
    // Order the children using the key attribute in
    // both arrays of children and compare them first, then
    // the other nodes that have been added or removed, then
    // render them in the correct order

    // Add/remove attributes
    diffAttributes(previous, current, context);

    // Recursive
    diffChildren(previous, current, context);
  }

  function trigger(name, entity, args) {
    entity.lifecycle = name;
    if (typeof entity.component[name] === 'function') {
      args.push(send); // last arg is `send`
      entity.component[name].apply(null, args);
    }
    entity.lifecycle = null;

    function send(nextState) {
      checkSetState(entity.lifecycle);
      entity._pendingState = assign(entity._pendingState, nextState);
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

  function commit(entity) {
    entity.state = entity._pendingState;
    entity.props = entity._pendingProps;
    entity._pendingState = assign({}, entity.state);
    entity._pendingProps = assign({}, entity.props);
    entity.dirty = false;
  }

  function shouldUpdate(entity) {
    if (!entity.dirty) return false;
    var nextState = entity._pendingState;
    var nextProps = entity._pendingProps;
    return entity.component.shouldUpdate(entity.props, entity.state, nextProps, nextState);
  };

  return teardown;
};

/**
 * A rendered component instance.
 *
 * This manages the lifecycle, props and state of the component.
 *
 * @param {Function} component
 * @param {Object} props
 */

function Entity(component, props) {
  this.id = uid();
  this.options = component.options;
  this.props = props || {};
  this.component = component;
  this.state = this.component.initialState(this.props);
  this.lifecycle = null;
  this._pendingProps = assign({}, this.props);
  this._pendingState = assign({}, this.state);
  this.dirty = false;
}
