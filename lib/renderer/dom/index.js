
/**
 * Dependencies.
 */

var Interactions = require('./interactions');
var virtualize = require('../../virtualize');
var shallowCopy = require('shallow-copy');
var each = require('component-each');
var raf = require('component-raf');
var Value = require('../../value');
var assign = require('extend');
var Pool = require('dom-pool');
var walk = require('dom-walk');
var zip = require('array-zip');
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
 * Expose `rendering`.
 */

module.exports = rendering;

/**
 * Let the app render components to the DOM.
 *
 * @param {Application} app
 * @return {Function} teardown
 */

function rendering(app) {
  setup();

  /**
   * Setup dom render.
   */

  function setup() {
    app.events = new Interactions(document.body);
    app.entities = {};
    app.layers = {};
    app.pools = {};
    app.on('unmount', onunmount);
    app.on('mount', onmount);
    app.on('update component', onupdate);
    app.on('register layer', onregister);
  }

  /**
   * Teardown dom rendering.
   */

  function teardown() {
    app.entities = {};
    app.layers = {};
    app.pools = {};
    app.off('unmount', onunmount);
    app.off('mount', onmount);
    app.off('update component', update)
    app.off('register layer', onregister);
  }

  /**
   * Register a layer.
   */

  function onregister(data) {
    var name = data.name;
    var el = data.el;
    app.layers[name] = el;
  }

  /**
   * When you mount your root component into the app.
   */

  function onmount(data) {
    var container = app.layers.main;
    var component = data.component;
    var props = data.props;
    app.root = new RenderData(component, props);
    var el = mount(app.root);
    container.appendChild(el);
  }

  function onunmount() {
    remove();
  }

  /**
   * Update a component from the outside.
   *
   * TODO: currently this is just used for tests, to change the root component props.
   * This definitely should be cleaned up but not sure the goal yet.
   */

  function onupdate(data) {
    var props = data.props;
    var path = data.path;
    if ('0' === path) {
      var renderData = app.root;
      renderData.pendingProps = assign(renderData.pendingProps, props);
      renderData.dirty = true;
      invalidate();
    }
  }

  /**
   * Render and mount a component to the native dom.
   *
   * @param {RenderData} renderData
   * @return {HTMLElement}
   */

  function mount(renderData) {
    register(renderData);
    setDefaults(renderData);
    renderData.children = {};
    app.entities[renderData.id] = renderData;

    // commit initial state and props.
    commit(renderData);

    // callback before mounting.
    trigger('beforeMount', renderData, [
      renderData.props,
      renderData.state
    ]);

    constructRenderData(renderData);

    var nativeElement = renderData.nativeElement;

    // callback after mounting.
    trigger('afterMount', renderData, [
      nativeElement,
      renderData.props,
      renderData.state
    ]);

    // mount all components to their respective layers
    // except `main`, which gets mounted to the parent.
    mountLayers(renderData);

    // return one that gets mounted to the parent component.
    return nativeElement;
  }

  /**
   * Construct all layers for a component instance.
   *
   * @param {RenderData} renderData
   */

  function constructRenderData(renderData) {
    // render virtual element.
    var component = renderData.component;
    renderData.lifecycle = 'render';
    renderData.layers = {};
    var layers = component.layers;
    for (var name in layers) {
      var layer = layers[name];
      var virtualElement = layer.template.call(null, renderData.props, renderData.state, send);
      if (!virtualElement) virtualElement = virtualize.node('noscript');
      // create native element.
      var nativeElement = toNative(renderData.id, '0', virtualElement);
      renderData.layers[name] = {
        virtualElement: virtualElement,
        nativeElement: nativeElement,
        children: {},
        id: renderData.id
      };
    }

    renderData.lifecycle = null;
    renderData.virtualElement = renderData.layers.main.virtualElement;
    renderData.nativeElement = renderData.layers.main.nativeElement;

    // TODO: update renderData events to work on all layers
    updateEvents(renderData);

    // Whenever setState or setProps is called, we mark the renderData
    // as dirty in the renderer. This lets us optimize the re-rendering
    // and skip components that definitely haven't changed.
    function send(nextState) {
      updateRenderDataState(renderData, nextState);
    }
  }

  function mountLayers(renderData) {
    var layers = renderData.layers;
    for (var name in layers) {
      // `main` layer means it's appended to parent element,
      // while all other layers mean it's "somewhere else".
      if ('main' == name) continue;
      var layer = layers[name];
      var container = app.layers[name];
      var el = layer.nativeElement;
      // TODO: do diffing here, need to think about this more.
      var childEl = container.children[0]; // assuming there can only ever be 1 child here for the moment.
      if (!childEl) {
        container.appendChild(el);
      } else {
        var next = layer.virtualElement;
        patch(renderData, null, next, childEl);
      }
    }
  }

  /**
   * Remove a component from the native dom.
   *
   * @param {RenderData} renderData
   */

  function unmount(renderData) {
    var el = renderData.nativeElement;
    if (!el) return;
    unmountChildren(renderData);
    trigger('beforeUnmount', renderData, [
      el,
      renderData.props,
      renderData.state
    ]);
    removeEvents(renderData);
    delete app.entities[renderData.id];
  }

  /**
   * Compute the renderData and make sure it returns a node
   *
   * @param {RenderData} renderData
   *
   * @return {VirtualTree}
   */

  function computeRenderData(renderData) {
    var component = renderData.component;
    renderData.lifecycle = 'render';
    var layers = component.layers;
    var result = layers.main.template.call(null, renderData.props, renderData.state, send);
    if (!result) result = virtualize.node('noscript');
    renderData.lifecycle = null;
    return result;

    // Whenever setState or setProps is called, we mark the renderData
    // as dirty in the renderer. This lets us optimize the re-rendering
    // and skip components that definitely haven't changed.
    function send(nextState) {
      updateRenderDataState(renderData, nextState);
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
   * The renderData is just the data object for a component instance.
   *
   * @param {String} id Component instance id.
   */

  function update(id) {
    var renderData = app.entities[id];
    if (!shouldUpdate(renderData)) return updateChildren(id);

    var currentTree = renderData.virtualElement;
    var nextProps = renderData.pendingProps;
    var nextState = renderData.pendingState;
    var el = renderData.nativeElement;
    var previousState = renderData.state;
    var previousProps = renderData.props;

    // hook before rendering. could modify state just before the render occurs.
    trigger('beforeUpdate', renderData, [
      previousProps,
      previousState,
      nextProps,
      nextState
    ]);

    // commit state and props.
    commit(renderData);

    // re-render.
    var nextTree = computeRenderData(renderData);

    // apply new virtual tree to native dom.
    patch(renderData, currentTree, nextTree, el);
    renderData.virtualElement = nextTree;
    updateEvents(renderData);
    updateChildren(id);
    var currentProps = renderData.props;
    var currentState = renderData.state;

    // trigger afterUpdate after all children have updated.
    trigger('afterUpdate', renderData, [
      currentProps,
      currentState,
      previousProps,
      previousState
    ]);
  }

  /**
   * Updates all the DOM event bindings for an renderData.
   *
   * @param {RenderData} renderData
   */

  function updateEvents(renderData) {
    app.events.unbind(renderData.id);
    var nodes = tree(renderData.virtualElement).nodes;

    // TODO: Optimize this by storing the events in the Tree
    // object on the initial pass instead of looping again.
    // eg. renderData.current.events -> '0.0.1:click': fn
    each(nodes, function(path, node){
      if (node.type !== 'element') return;
      each(node.events, function(eventType, fn){
        app.events.bind(renderData.id, path, eventType, function(e){
          fn.call(renderData.component, e, renderData.props, renderData.state);
        });
      });
    });
  }

  /**
   * Update all the children of an renderData.
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
   * Unbind all events from an renderData
   *
   * @param {RenderData} renderData
   */

  function removeEvents(renderData) {
    app.events.unbind(renderData.id);
  }

  /**
   * Remove all of the child entities of an renderData
   *
   * @param {RenderData} renderData
   */

  function unmountChildren(renderData) {
    var entities = app.entities;
    var children = renderData.children;
    for (var path in children) {
      var childId = children[path];
      unmount(entities[childId]);
    }
  }

  /**
   * Create a native element from a virtual element.
   *
   * @param {String} renderDataId
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {HTMLDocumentFragment}
   */

  function toNative(renderDataId, path, vnode) {
    var renderData = app.entities[renderDataId];

    switch (vnode.type) {
      case 'text': return toNativeText(vnode);
      case 'element': return toNativeElement(renderData, path, vnode);
      case 'component': return toNativeComponent(renderData, path, vnode);
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

  function toNativeElement(renderData, path, vnode) {
    var disablePooling = renderData.options.disablePooling;
    var attributes = vnode.attributes;
    var children = vnode.children;
    var tagName = vnode.tagName;
    var renderDataId = renderData.id;

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
    el.__renderData__ = renderDataId;
    el.__path__ = path;

    // add children.
    children.forEach(function(child, i){
      var childEl = toNative(renderDataId, path + '.' + i, child);
      if (!childEl.parentNode) el.appendChild(childEl);
    });

    return el;
  }

  /**
   * Create a native element from a component.
   */

  function toNativeComponent(renderData, path, vnode) {
    var renderDataId = renderData.id;
    var child = new RenderData(vnode.component, vnode.props);
    renderData.children[path] = child.id;
    return mount(child);
  }

  /**
   * Patch an element with the diff from two trees.
   */

  function patch(renderData, prev, next, el) {
    diffNode('0', renderData, prev, next, el);
  }

  /**
   * Create a diff between two tress of nodes.
   */

   function diffNode(path, renderData, prev, next, el) {
    // Type changed. This could be from element->text, text->ComponentA,
    // ComponentA->ComponentB etc. But NOT div->span. These are the same type
    // (ElementNode) but different tag name.
    if (prev.type !== next.type) return replaceElement(renderData, path, el, next);

    switch (next.type) {
      case 'text': return diffText(prev, next, el);
      case 'element': return diffElement(path, renderData, prev, next, el);
      case 'component': return diffComponent(path, renderData, prev, next, el);
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

  function diffChildren(path, renderData, prev, next, el) {
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
        var childEl = toNative(renderData.id, childPath, right);
        el.appendChild(childEl);
        continue;
      }

      // the node has been removed.
      if (right == null) {
        removeElement(renderData.id, childPath, el.childNodes[j])
        j = j - 1;
        continue;
      }

      diffNode(childPath, renderData, left, right, el.childNodes[j]);
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

  function diffComponent(path, renderData, prev, next, el) {
    if (next.component !== prev.component) {
      replaceElement(renderData, path, el, next);
    } else {
      updateRenderData(renderData, path, next);
    }
  }

  /**
   * Diff two element nodes.
   */

  function diffElement(path, renderData, prev, next, el) {
    // different node, so swap them. If the root node of the component has changed it's
    // type we need to update this to point to this new element
    if (next.tagName !== prev.tagName) return replaceElement(renderData, path, el, next);
    diffAttributes(prev, next, el);
    diffChildren(path, renderData, prev, next, el);
  }

  /**
   * Removes an element from the DOM and unmounts and components
   * that are within that branch
   *
   * side effects:
   *   - removes element from the DOM
   *   - removes internal references
   *
   * @param {String} renderDataId
   * @param {String} path
   * @param {HTMLElement} el
   */

  function removeElement(renderDataId, path, el) {
    var children = app.entities[renderDataId].children;
    var entities = shallowCopy(app.entities);
    var renderData = entities[renderDataId];

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
      var parent = entities[node.__renderData__];
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
   * @param {RenderData} renderData
   * @param {String} path
   * @param {HTMLElement} el
   * @param {Object} vnode
   *
   * @return {void}
   */

  function replaceElement(renderData, path, el, vnode) {
    var renderDataId = renderData.id;
    var parent = el.parentNode;
    var index = Array.prototype.indexOf.call(parent.childNodes, el);
    var entities = app.entities;

    // remove the previous element and all nested components. This
    // needs to happen before we create the new element so we don't
    // get clashes on the component paths.
    removeElement(renderDataId, path, el);

    // then add the new element in there
    var newEl = toNative(renderDataId, path, vnode);
    var target = parent.childNodes[index];

    if (target) {
      parent.insertBefore(newEl, target);
    } else {
      parent.appendChild(newEl);
    }

    // update all `renderData.nativeElement` references.
    for (var id in entities) {
      var renderData = entities[id];
      if (renderData.nativeElement === el) {
        renderData.nativeElement = newEl;
      }
    }
  }

  /**
   * Update an renderData to match the latest rendered vode. We always
   * replace the props on the component when composing them. This
   * will trigger a re-render on all children below this point.
   *
   * @param {RenderData} renderData
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {void}
   */

  function updateRenderData(renderData, path, vnode) {
    var childId = renderData.children[path];
    var renderData = app.entities[childId];
    renderData.pendingProps = vnode.props;
    renderData.dirty = true;
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
   * @param {RenderData} renderData The component instance.
   * @param {Array} args To pass along to hook.
   */

  function trigger(name, renderData, args) {
    renderData.lifecycle = name;
    if (typeof renderData.component[name] === 'function') {
      args.push(send); // last arg is `send`
      renderData.component[name].apply(null, args);
    }
    renderData.lifecycle = null;

    /**
     * Function for hook to set state if desired.
     *
     * @param {Object} nextState
     */

    function send(nextState) {
      updateRenderDataState(renderData, nextState);
    }
  }

  /**
   * Update component instance state.
   */

  function updateRenderDataState(renderData, nextState) {
    checkSetState(renderData.lifecycle);
    renderData.pendingState = assign(renderData.pendingState, nextState);
    renderData.dirty = true;
    invalidate();
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
   * Commit props and state changes to an renderData.
   */

  function commit(renderData) {
    renderData.state = renderData.pendingState;
    renderData.props = renderData.pendingProps;
    renderData.pendingState = assign({}, renderData.state);
    renderData.pendingProps = assign({}, renderData.props);
    renderData.dirty = false;
  }

  /**
   * Try to avoid creating new virtual dom if possible.
   *
   * Later we may expose this so you can override, but not there yet.
   */

  function shouldUpdate(renderData) {
    if (!renderData.dirty) return false;
    var nextProps = renderData.pendingProps;
    var nextState = renderData.pendingState;
    var component = renderData.component;
    var prevProps = renderData.props;
    var prevState = renderData.state;
    var bool = component.shouldUpdate(prevProps, prevState, nextProps, nextState);
    return bool;
  };

  /**
   * Register an renderData.
   *
   * This is mostly to pre-preprocess component properties and values chains.
   *
   * The end result is for every component that gets mounted,
   * you create a set of IO nodes in the network from the `value` definitions.
   *
   * @param {Component} component
   */

  function register(renderData) {
    var component = renderData.component;
    // all entities for this component type.
    var entities = component.entities = component.entities || {};
    // add renderData to component list
    entities[renderData.id] = renderData;

    // get "class-level" values.
    var values = component.values;
    if (values) return;

    var map = component.valueToPropertyName = {};
    component.values = values = [];
    var props = component.props;
    for (var name in props) {
      var data = props[name];
      if (!(data instanceof Value)) continue;
      values.push(data);
      map[data.id] = name;
    }

    // insert values into the io network.
    values.forEach(function(value){
      app.send('insert value', value);
    });

    // send value updates to all component instances.
    values.forEach(function(value){
      value.on('update', send);

      function send(data) {
        var prop = map[value.id];
        for (var id in entities) {
          var renderData = entities[id];
          var changes = {};
          changes[prop] = data;
          var props = assign({}, renderData.props);
          props = assign(props, changes);
          renderData.pendingProps = assign(renderData.pendingProps, props);
          renderData.dirty = true;
          invalidate();
        };
      }
    });
  }

  function setDefaults(renderData) {
    var component = renderData.component;
    var map = component.valueToPropertyName;
    var component = renderData.component;
    var values = component.values;
    values.forEach(function(value){
      var name = map[value.id];
      if (null != renderData.pendingProps[name]) return;
      renderData.pendingProps[name] = value.get(); // get latest value plugged into io network
    });
  }

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

function RenderData(component, props) {
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
  this.layers = {};
}
