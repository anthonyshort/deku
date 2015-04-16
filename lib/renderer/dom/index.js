
/**
 * Dependencies.
 */

var virtual = require('../../virtual');
var each = require('component-each');
var raf = require('component-raf');
var Value = require('../../value');
var assign = require('object-assign');
var Pool = require('dom-pool');
var walk = require('dom-walk');
var zip = require('array-zip');
var isDom = require('is-dom');
var uid = require('get-uid');
var throttle = require('per-frame');
var keypath = require('object-path');
var omit = require('lodash.omit');

/**
 * All of the events can bind to
 */

var events = {
  onBlur: 'blur',
  onChange: 'change',
  onClick: 'click',
  onContextMenu: 'contextmenu',
  onCopy: 'copy',
  onCut: 'cut',
  onDoubleClick: 'dblclick',
  onDrag: 'drag',
  onDragEnd: 'dragend',
  onDragEnter: 'dragenter',
  onDragExit: 'dragexit',
  onDragLeave: 'dragleave',
  onDragOver: 'dragover',
  onDragStart: 'dragstart',
  onDrop: 'drop',
  onFocus: 'focus',
  onInput: 'input',
  onKeyDown: 'keydown',
  onKeyUp: 'keyup',
  onMouseDown: 'mousedown',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
  onPaste: 'paste',
  onScroll: 'scroll',
  onSubmit: 'submit',
  onTouchCancel: 'touchcancel',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchStart: 'touchstart'
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
  var frameId;
  var isRendering;

  setup();

  /**
   * Setup dom render.
   */

  function setup() {
    addNativeEventListeners();
    app.renderRecords = {};
    app.pools = {};
    app.handlers = {};
    app.on('unmount component', onunmount);
    app.on('mount component', onmount);
    app.on('update component', onupdate);
  }

  /**
   * Teardown dom rendering.
   */

  function teardown() {
    removeNativeEventListeners();
    delete app.pools;
    delete app.handlers;
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
      var renderRecord = app.root;
      renderRecord.pendingProps = assign(renderRecord.pendingProps, properties);
      renderRecord.dirty = true;
      invalidate();
    }
  }

  function init(path, component, properties, container) {
    // TODO: for now, since we can only have 1 root element,
    // this is hardcoded to 1 root.
    // this is currently just decoupling app module from renderRecord,
    // initial first step
    app.root = new RenderRecord(component, properties);
    var el = mount(app.root);
    container.appendChild(el);
  }

  /**
   * Render and mount a component to the native dom.
   *
   * @param {RenderRecord} renderRecord
   * @return {HTMLElement}
   */

  function mount(renderRecord) {
    register(renderRecord);
    setDefaults(renderRecord);
    renderRecord.children = {};
    app.renderRecords[renderRecord.id] = renderRecord;

    // commit initial state and props.
    commit(renderRecord);

    // callback before mounting.
    trigger('beforeMount', renderRecord, [
      renderRecord.props,
      renderRecord.state
    ]);

    // render virtual element.
    var virtualElement = renderRenderRecord(renderRecord);
    // create native element.
    var nativeElement = toNative(renderRecord.id, '0', virtualElement);

    renderRecord.virtualElement = virtualElement;
    renderRecord.nativeElement = nativeElement;

    // callback after mounting.
    trigger('afterMount', renderRecord, [
      nativeElement,
      renderRecord.props,
      renderRecord.state
    ]);

    return nativeElement;
  }

  /**
   * Remove a component from the native dom.
   *
   * @param {RenderRecord} renderRecord
   */

  function unmount(renderRecord) {
    var el = renderRecord.nativeElement;
    if (!el) return;
    unmountChildren(renderRecord);
    trigger('beforeUnmount', renderRecord, [
      el,
      renderRecord.props,
      renderRecord.state
    ]);
    removeAllEvents(renderRecord);

    // Remove the renderRecord without touching the original
    // object so that it retains fast propertiesin v8.
    app.renderRecords = omit(app.renderRecords, renderRecord.id);
  }

  /**
   * Render the renderRecord and make sure it returns a node
   *
   * @param {RenderRecord} renderRecord
   *
   * @return {VirtualTree}
   */

  function renderRenderRecord(renderRecord) {
    var component = renderRecord.component;
    var result = component.render(renderRecord.props, renderRecord.state, send);
    if (!result) result = virtual('noscript');
    return result;

    // Whenever setState or setProps is called, we mark the renderRecord
    // as dirty in the renderer. This lets us optimize the re-rendering
    // and skip components that definitely haven't changed.
    function send(nextState) {
      updateRenderRecordState(renderRecord, nextState);
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
   * The renderRecord is just the data object for a component instance.
   *
   * @param {String} id Component instance id.
   */

  function update(id) {
    var renderRecord = app.renderRecords[id];
    if (!shouldUpdate(renderRecord)) return updateChildren(id);

    var currentTree = renderRecord.virtualElement;
    var nextProps = renderRecord.pendingProps;
    var nextState = renderRecord.pendingState;
    var el = renderRecord.nativeElement;
    var previousState = renderRecord.state;
    var previousProps = renderRecord.props;

    // hook before rendering. could modify state just before the render occurs.
    trigger('beforeUpdate', renderRecord, [
      previousProps,
      previousState,
      nextProps,
      nextState
    ]);

    // commit state and props.
    commit(renderRecord);

    // re-render.
    var nextTree = renderRenderRecord(renderRecord);

    // apply new virtual tree to native dom.
    patch(renderRecord, currentTree, nextTree, el);
    renderRecord.virtualElement = nextTree;
    updateChildren(id);
    var currentProps = renderRecord.props;
    var currentState = renderRecord.state;

    // trigger afterUpdate after all children have updated.
    trigger('afterUpdate', renderRecord, [
      currentProps,
      currentState,
      previousProps,
      previousState
    ]);
  }

  /**
   * Update all the children of an renderRecord.
   *
   * @param {String} id Component instance id.
   */

  function updateChildren(id) {
    var children = app.renderRecords[id].children;
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

    // Empty the pools so that our elements don't
    // stay in memory accidentally.
    app = null;
  }

  /**
   * Remove all of the child renderRecords of an renderRecord
   *
   * @param {RenderRecord} renderRecord
   */

  function unmountChildren(renderRecord) {
    var renderRecords = app.renderRecords;
    var children = renderRecord.children;
    for (var path in children) {
      var childId = children[path];
      unmount(renderRecords[childId]);
    }
  }

  /**
   * Create a native element from a virtual element.
   *
   * @param {String} renderRecordId
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {HTMLDocumentFragment}
   */

  function toNative(renderRecordId, path, vnode) {
    var renderRecord = app.renderRecords[renderRecordId];

    switch (vnode.type) {
      case 'text': return toNativeText(vnode);
      case 'element': return toNativeElement(renderRecord, path, vnode);
      case 'component': return toNativeComponent(renderRecord, path, vnode);
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

  function toNativeElement(renderRecord, path, vnode) {
    var disablePooling = renderRecord.options.disablePooling;
    var attributes = vnode.attributes;
    var children = vnode.children;
    var tagName = vnode.tagName;
    var renderRecordId = renderRecord.id;

    // create element either from pool or fresh.
    if (disablePooling) {
      var el = document.createElement(tagName);
    } else {
      var pool = getPool(tagName);
      var el = cleanup(pool.pop());
      if (el.parentNode) el.parentNode.removeChild(el);
    }

    // set attributes.
    for (var name in attributes) setAttribute(renderRecordId, path, el, name, attributes[name]);

    // store keys on the native element for fast event handling.
    el.__renderRecord__ = renderRecordId;
    el.__path__ = path;

    // add children.
    children.forEach(function(child, i){
      var childEl = toNative(renderRecordId, path + '.' + i, child);
      if (!childEl.parentNode) el.appendChild(childEl);
    });

    return el;
  }

  /**
   * Create a native element from a component.
   */

  function toNativeComponent(renderRecord, path, vnode) {
    var renderRecordId = renderRecord.id;
    var child = new RenderRecord(vnode.component, vnode.props);
    renderRecord.children[path] = child.id;
    return mount(child);
  }

  /**
   * Patch an element with the diff from two trees.
   */

  function patch(renderRecord, prev, next, el) {
    diffNode('0', renderRecord, prev, next, el);
  }

  /**
   * Create a diff between two tress of nodes.
   */

   function diffNode(path, renderRecord, prev, next, el) {
    // Type changed. This could be from element->text, text->ComponentA,
    // ComponentA->ComponentB etc. But NOT div->span. These are the same type
    // (ElementNode) but different tag name.
    if (prev.type !== next.type) return replaceElement(renderRecord, path, el, next);

    switch (next.type) {
      case 'text': return diffText(prev, next, el);
      case 'element': return diffElement(path, renderRecord, prev, next, el);
      case 'component': return diffComponent(path, renderRecord, prev, next, el);
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

  function diffChildren(path, renderRecord, prev, next, el) {
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
        var childEl = toNative(renderRecord.id, childPath, right);
        el.appendChild(childEl);
        continue;
      }

      // the node has been removed.
      if (right == null) {
        removeElement(renderRecord.id, childPath, el.childNodes[j])
        j = j - 1;
        continue;
      }

      diffNode(childPath, renderRecord, left, right, el.childNodes[j]);
    }
  }

  /**
   * Diff the attributes and add/remove them.
   */

  function diffAttributes(prev, next, el, renderRecord, path) {
    var nextAttrs = next.attributes;
    var prevAttrs = prev.attributes;

    // add new attrs
    for (var name in nextAttrs) {
      var value = nextAttrs[name];
      if (!(name in prevAttrs) || prevAttrs[name] !== value) {
        setAttribute(renderRecord.id, path, el, name, value);
      }
    }

    // remove old attrs
    for (var oldName in prevAttrs) {
      if (!(oldName in nextAttrs)) {
        removeAttribute(renderRecord.id, path, el, oldName);
      }
    }
  }

  /**
   * Update a component with the props from the next node. If
   * the component type has changed, we'll just remove the old one
   * and replace it with the new component.
   */

  function diffComponent(path, renderRecord, prev, next, el) {
    if (next.component !== prev.component) {
      replaceElement(renderRecord, path, el, next);
    } else {
      updateRenderRecordProps(renderRecord, path, next);
    }
  }

  /**
   * Diff two element nodes.
   */

  function diffElement(path, renderRecord, prev, next, el) {
    // different node, so swap them. If the root node of the component has changed it's
    // type we need to update this to point to this new element
    if (next.tagName !== prev.tagName) return replaceElement(renderRecord, path, el, next);
    diffAttributes(prev, next, el, renderRecord, path);
    diffChildren(path, renderRecord, prev, next, el);
  }

  /**
   * Removes an element from the DOM and unmounts and components
   * that are within that branch
   *
   * side effects:
   *   - removes element from the DOM
   *   - removes internal references
   *
   * @param {String} renderRecordId
   * @param {String} path
   * @param {HTMLElement} el
   */

  function removeElement(renderRecordId, path, el) {
    var children = app.renderRecords[renderRecordId].children;
    var renderRecords = app.renderRecords;
    var removals = [];

    // If the path points to a component we should use that
    // components element instead, because it might have moved it.
    if (children[path]) {
      var childId = children[path];
      var child = renderRecords[childId];
      el = child.nativeElement;
      unmount(child);
      removals.push(path);
    } else {
      // Just remove the text node
      if (!isElement(el)) return el.parentNode.removeChild(el);

      // Then we need to find any components within this
      // branch and unmount them.
      for (var childPath in children) {
        if (childPath === path || isWithinPath(path, childPath)) {
          unmount(renderRecords[children[childPath]]);
          removals.push(childPath);
        }
      }
    }

    // Remove the paths from the object without touching the
    // old object. This keeps the object using fast properties.
    app.renderRecords[renderRecordId].children = omit(children, removals);

    // Return all of the elements in this node tree to the pool
    // so that the elements can be re-used.
    walk(el, function(node){
      if (!isElement(node)) return;
      var parent = renderRecords[node.__renderRecord__];
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
   * @param {RenderRecord} renderRecord
   * @param {String} path
   * @param {HTMLElement} el
   * @param {Object} vnode
   *
   * @return {void}
   */

  function replaceElement(renderRecord, path, el, vnode) {
    var renderRecordId = renderRecord.id;
    var parent = el.parentNode;
    var index = Array.prototype.indexOf.call(parent.childNodes, el);
    var renderRecords = app.renderRecords;

    // remove the previous element and all nested components. This
    // needs to happen before we create the new element so we don't
    // get clashes on the component paths.
    removeElement(renderRecordId, path, el);

    // then add the new element in there
    var newEl = toNative(renderRecordId, path, vnode);
    var target = parent.childNodes[index];

    if (target) {
      parent.insertBefore(newEl, target);
    } else {
      parent.appendChild(newEl);
    }

    // update all `renderRecord.nativeElement` references.
    for (var id in renderRecords) {
      var renderRecord = renderRecords[id];
      if (renderRecord.nativeElement === el) {
        renderRecord.nativeElement = newEl;
      }
    }
  }

  /**
   * Update an renderRecord to match the latest rendered vode. We always
   * replace the props on the component when composing them. This
   * will trigger a re-render on all children below this point.
   *
   * @param {RenderRecord} renderRecord
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {void}
   */

  function updateRenderRecordProps(renderRecord, path, vnode) {
    var childId = renderRecord.children[path];
    var renderRecord = app.renderRecords[childId];
    renderRecord.pendingProps = vnode.props;
    renderRecord.dirty = true;
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

  function setAttribute(renderRecordId, path, el, name, value) {
    if (events[name] != null) {
      addEvent(renderRecordId, path, events[name], value);
      return;
    }
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
   * Remove an attribute, performing additional transformations
   * dependning on the attribute name
   *
   * @param {HTMLElement} el
   * @param {String} name
   */

  function removeAttribute(renderRecordId, path, el, name) {
    if (events[name] != null) {
      removeEvent(renderRecordId, path, events[name]);
      return;
    }
    el.removeAttribute(name);
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
   * @param {RenderRecord} renderRecord The component instance.
   * @param {Array} args To pass along to hook.
   */

  function trigger(name, renderRecord, args) {
    if (typeof renderRecord.component[name] === 'function') {
      args.push(send); // last arg is `send`
      renderRecord.component[name].apply(null, args);
    }

    /**
     * Function for hook to set state if desired.
     *
     * @param {Object} nextState
     */

    function send(nextState) {
      updateRenderRecordState(renderRecord, nextState);
    }
  }

  /**
   * Update component instance state.
   */

  function updateRenderRecordState(renderRecord, nextState) {
    renderRecord.pendingState = assign(renderRecord.pendingState, nextState);
    renderRecord.dirty = true;
    invalidate();
  }

  /**
   * Commit props and state changes to an renderRecord.
   */

  function commit(renderRecord) {
    renderRecord.state = renderRecord.pendingState;
    renderRecord.props = renderRecord.pendingProps;
    renderRecord.pendingState = assign({}, renderRecord.state);
    renderRecord.pendingProps = assign({}, renderRecord.props);
    renderRecord.dirty = false;
  }

  /**
   * Try to avoid creating new virtual dom if possible.
   *
   * Later we may expose this so you can override, but not there yet.
   */

  function shouldUpdate(renderRecord) {
    if (!renderRecord.dirty) return false;
    var nextProps = renderRecord.pendingProps;
    var nextState = renderRecord.pendingState;
    var component = renderRecord.component;
    var prevProps = renderRecord.props;
    var prevState = renderRecord.state;
    var bool = component.shouldUpdate(prevProps, prevState, nextProps, nextState);
    return bool;
  };

  /**
   * Register an renderRecord.
   *
   * This is mostly to pre-preprocess component properties and values chains.
   *
   * The end result is for every component that gets mounted,
   * you create a set of IO nodes in the network from the `value` definitions.
   *
   * @param {Component} component
   */

  function register(renderRecord) {
    var component = renderRecord.component;
    // all renderRecords for this component type.
    var renderRecords = component.renderRecords = component.renderRecords || {};
    // add renderRecord to component list
    renderRecords[renderRecord.id] = renderRecord;

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
        for (var id in renderRecords) {
          var renderRecord = renderRecords[id];
          var changes = {};
          changes[prop] = data;
          var props = assign({}, renderRecord.props);
          props = assign(props, changes);
          renderRecord.pendingProps = assign(renderRecord.pendingProps, props);
          renderRecord.dirty = true;
          invalidate();
        };
      }
    });
  }

  function setDefaults(renderRecord) {
    var component = renderRecord.component;
    var map = component.valueToPropertyName;
    var component = renderRecord.component;
    var values = component.values;
    values.forEach(function(value){
      var name = map[value.id];
      if (null != renderRecord.pendingProps[name]) return;
      renderRecord.pendingProps[name] = value.get(); // get latest value plugged into io network
    });
  }

  /**
   * Add all of the DOM event listeners
   */

  function addNativeEventListeners() {
    Object.keys(events).forEach(function(attr){
      var eventType = events[attr];
      document.body.addEventListener(eventType, handleEvent, true);
    })
  }

  /**
   * Add all of the DOM event listeners
   */

  function removeNativeEventListeners() {
    Object.keys(events).forEach(function(attr){
      var eventType = events[attr];
      document.body.removeEventListener(eventType, handleEvent, true);
    })
  }

  /**
   * Handle an event that has occured within the container
   *
   * @param {Event} event
   */

  function handleEvent(event) {
    var target = event.target;
    var renderRecordId = target.__renderRecord__;
    var eventType = event.type;

    // Walk up the DOM tree and see if there is a handler
    // for this event type higher up.
    while (target && target.__renderRecord__ === renderRecordId) {
      var fn = keypath.get(app.handlers, [renderRecordId, target.__path__, eventType]);
      if (fn) {
        event.delegateTarget = target;
        fn(event);
        break;
      }
      target = target.parentNode;
    }
  }

  /**
   * Bind events for an element, and all it's rendered child elements.
   *
   * @param {String} path
   * @param {String} event
   * @param {Function} fn
   */

  function addEvent(renderRecordId, path, eventType, fn) {
    keypath.set(app.handlers, [renderRecordId, path, eventType], throttle(function(e){
      var renderRecord = app.renderRecords[renderRecordId];
      fn.call(null, e, renderRecord.props, renderRecord.state);
    }));
  }

  /**
   * Unbind events for a renderRecordId
   *
   * @param {String} renderRecordId
   */

  function removeEvent(renderRecordId, path, eventType) {
    keypath.del(app.handlers, [renderRecordId, path, eventType]);
  }

  /**
   * Unbind all events from an renderRecord
   *
   * @param {RenderRecord} renderRecord
   */

  function removeAllEvents(renderRecord) {
    keypath.del(app.handlers, [renderRecord.id]);
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

function RenderRecord(component, props) {
  this.id = uid();
  this.options = component.options;
  this.props = props || {};
  this.component = component;
  this.state = this.component.initialState(this.props);
  this.pendingProps = assign({}, this.props);
  this.pendingState = assign({}, this.state);
  this.dirty = false;
  this.virtualElement = null;
  this.nativeElement = null;
}
