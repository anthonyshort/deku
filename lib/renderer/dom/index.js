
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
      var record = app.root;
      record.pendingProps = assign(record.pendingProps, properties);
      record.dirty = true;
      invalidate();
    }
  }

  function init(path, component, properties, container) {
    // TODO: for now, since we can only have 1 root element,
    // this is hardcoded to 1 root.
    // this is currently just decoupling app module from record,
    // initial first step
    app.root = new RenderRecord(component, properties);
    var el = mount(app.root);
    container.appendChild(el);
  }

  /**
   * Render and mount a component to the native dom.
   *
   * @param {RenderRecord} record
   * @return {HTMLElement}
   */

  function mount(record) {
    register(record);
    setDefaults(record);
    record.children = {};
    app.renderRecords[record.id] = record;

    // commit initial state and props.
    commit(record);

    // callback before mounting.
    trigger('beforeMount', record, [
      record.props,
      record.state
    ]);

    // render virtual element.
    var virtualElement = renderRenderRecord(record);
    // create native element.
    var nativeElement = toNative(record.id, '0', virtualElement);

    record.virtualElement = virtualElement;
    record.nativeElement = nativeElement;

    // callback after mounting.
    trigger('afterMount', record, [
      nativeElement,
      record.props,
      record.state
    ]);

    return nativeElement;
  }

  /**
   * Remove a component from the native dom.
   *
   * @param {RenderRecord} record
   */

  function unmount(record) {
    var el = record.nativeElement;
    if (!el) return;
    unmountChildren(record);
    trigger('beforeUnmount', record, [
      el,
      record.props,
      record.state
    ]);
    removeAllEvents(record);

    // Remove the record without touching the original
    // object so that it retains fast propertiesin v8.
    app.renderRecords = omit(app.renderRecords, record.id);
  }

  /**
   * Render the record and make sure it returns a node
   *
   * @param {RenderRecord} record
   *
   * @return {VirtualTree}
   */

  function renderRenderRecord(record) {
    var component = record.component;
    var result = component.render(record.props, record.state, send);
    if (!result) result = virtual('noscript');
    return result;

    // Whenever setState or setProps is called, we mark the record
    // as dirty in the renderer. This lets us optimize the re-rendering
    // and skip components that definitely haven't changed.
    function send(nextState) {
      updateRenderRecordState(record, nextState);
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
   * The record is just the data object for a component instance.
   *
   * @param {String} id Component instance id.
   */

  function update(id) {
    var record = app.renderRecords[id];
    if (!shouldUpdate(record)) return updateChildren(id);

    var currentTree = record.virtualElement;
    var nextProps = record.pendingProps;
    var nextState = record.pendingState;
    var el = record.nativeElement;
    var previousState = record.state;
    var previousProps = record.props;

    // hook before rendering. could modify state just before the render occurs.
    trigger('beforeUpdate', record, [
      previousProps,
      previousState,
      nextProps,
      nextState
    ]);

    // commit state and props.
    commit(record);

    // re-render.
    var nextTree = renderRenderRecord(record);

    // apply new virtual tree to native dom.
    patch(record, currentTree, nextTree, el);
    record.virtualElement = nextTree;
    updateChildren(id);
    var currentProps = record.props;
    var currentState = record.state;

    // trigger afterUpdate after all children have updated.
    trigger('afterUpdate', record, [
      currentProps,
      currentState,
      previousProps,
      previousState
    ]);
  }

  /**
   * Update all the children of an record.
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
   * Remove all of the child renderRecords of an record
   *
   * @param {RenderRecord} record
   */

  function unmountChildren(record) {
    var renderRecords = app.renderRecords;
    var children = record.children;
    for (var path in children) {
      var childId = children[path];
      unmount(renderRecords[childId]);
    }
  }

  /**
   * Create a native element from a virtual element.
   *
   * @param {String} recordId
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {HTMLDocumentFragment}
   */

  function toNative(recordId, path, vnode) {
    var record = app.renderRecords[recordId];

    switch (vnode.type) {
      case 'text': return toNativeText(vnode);
      case 'element': return toNativeElement(record, path, vnode);
      case 'component': return toNativeComponent(record, path, vnode);
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

  function toNativeElement(record, path, vnode) {
    var disablePooling = record.options.disablePooling;
    var attributes = vnode.attributes;
    var children = vnode.children;
    var tagName = vnode.tagName;
    var recordId = record.id;

    // create element either from pool or fresh.
    if (disablePooling) {
      var el = document.createElement(tagName);
    } else {
      var pool = getPool(tagName);
      var el = cleanup(pool.pop());
      if (el.parentNode) el.parentNode.removeChild(el);
    }

    // set attributes.
    for (var name in attributes) setAttribute(recordId, path, el, name, attributes[name]);

    // store keys on the native element for fast event handling.
    el.__record__ = recordId;
    el.__path__ = path;

    // add children.
    children.forEach(function(child, i){
      var childEl = toNative(recordId, path + '.' + i, child);
      if (!childEl.parentNode) el.appendChild(childEl);
    });

    return el;
  }

  /**
   * Create a native element from a component.
   */

  function toNativeComponent(record, path, vnode) {
    var recordId = record.id;
    var child = new RenderRecord(vnode.component, vnode.props);
    record.children[path] = child.id;
    return mount(child);
  }

  /**
   * Patch an element with the diff from two trees.
   */

  function patch(record, prev, next, el) {
    diffNode('0', record, prev, next, el);
  }

  /**
   * Create a diff between two tress of nodes.
   */

   function diffNode(path, record, prev, next, el) {
    // Type changed. This could be from element->text, text->ComponentA,
    // ComponentA->ComponentB etc. But NOT div->span. These are the same type
    // (ElementNode) but different tag name.
    if (prev.type !== next.type) return replaceElement(record, path, el, next);

    switch (next.type) {
      case 'text': return diffText(prev, next, el);
      case 'element': return diffElement(path, record, prev, next, el);
      case 'component': return diffComponent(path, record, prev, next, el);
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

  function diffChildren(path, record, prev, next, el) {
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
        var childEl = toNative(record.id, childPath, right);
        el.appendChild(childEl);
        continue;
      }

      // the node has been removed.
      if (right == null) {
        removeElement(record.id, childPath, el.childNodes[j])
        j = j - 1;
        continue;
      }

      diffNode(childPath, record, left, right, el.childNodes[j]);
    }
  }

  /**
   * Diff the attributes and add/remove them.
   */

  function diffAttributes(prev, next, el, record, path) {
    var nextAttrs = next.attributes;
    var prevAttrs = prev.attributes;

    // add new attrs
    for (var name in nextAttrs) {
      var value = nextAttrs[name];
      if (!(name in prevAttrs) || prevAttrs[name] !== value) {
        setAttribute(record.id, path, el, name, value);
      }
    }

    // remove old attrs
    for (var oldName in prevAttrs) {
      if (!(oldName in nextAttrs)) {
        removeAttribute(record.id, path, el, oldName);
      }
    }
  }

  /**
   * Update a component with the props from the next node. If
   * the component type has changed, we'll just remove the old one
   * and replace it with the new component.
   */

  function diffComponent(path, record, prev, next, el) {
    if (next.component !== prev.component) {
      replaceElement(record, path, el, next);
    } else {
      updateRenderRecordProps(record, path, next);
    }
  }

  /**
   * Diff two element nodes.
   */

  function diffElement(path, record, prev, next, el) {
    // different node, so swap them. If the root node of the component has changed it's
    // type we need to update this to point to this new element
    if (next.tagName !== prev.tagName) return replaceElement(record, path, el, next);
    diffAttributes(prev, next, el, record, path);
    diffChildren(path, record, prev, next, el);
  }

  /**
   * Removes an element from the DOM and unmounts and components
   * that are within that branch
   *
   * side effects:
   *   - removes element from the DOM
   *   - removes internal references
   *
   * @param {String} recordId
   * @param {String} path
   * @param {HTMLElement} el
   */

  function removeElement(recordId, path, el) {
    var children = app.renderRecords[recordId].children;
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
    app.renderRecords[recordId].children = omit(children, removals);

    // Return all of the elements in this node tree to the pool
    // so that the elements can be re-used.
    walk(el, function(node){
      if (!isElement(node)) return;
      var parent = renderRecords[node.__record__];
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
   * @param {RenderRecord} record
   * @param {String} path
   * @param {HTMLElement} el
   * @param {Object} vnode
   *
   * @return {void}
   */

  function replaceElement(record, path, el, vnode) {
    var recordId = record.id;
    var parent = el.parentNode;
    var index = Array.prototype.indexOf.call(parent.childNodes, el);
    var renderRecords = app.renderRecords;

    // remove the previous element and all nested components. This
    // needs to happen before we create the new element so we don't
    // get clashes on the component paths.
    removeElement(recordId, path, el);

    // then add the new element in there
    var newEl = toNative(recordId, path, vnode);
    var target = parent.childNodes[index];

    if (target) {
      parent.insertBefore(newEl, target);
    } else {
      parent.appendChild(newEl);
    }

    // update all `record.nativeElement` references.
    for (var id in renderRecords) {
      var record = renderRecords[id];
      if (record.nativeElement === el) {
        record.nativeElement = newEl;
      }
    }
  }

  /**
   * Update an record to match the latest rendered vode. We always
   * replace the props on the component when composing them. This
   * will trigger a re-render on all children below this point.
   *
   * @param {RenderRecord} record
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {void}
   */

  function updateRenderRecordProps(record, path, vnode) {
    var childId = record.children[path];
    var record = app.renderRecords[childId];
    record.pendingProps = vnode.props;
    record.dirty = true;
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

  function setAttribute(recordId, path, el, name, value) {
    if (events[name] != null) {
      addEvent(recordId, path, events[name], value);
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

  function removeAttribute(recordId, path, el, name) {
    if (events[name] != null) {
      removeEvent(recordId, path, events[name]);
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
   * @param {RenderRecord} record The component instance.
   * @param {Array} args To pass along to hook.
   */

  function trigger(name, record, args) {
    if (typeof record.component[name] === 'function') {
      args.push(send); // last arg is `send`
      record.component[name].apply(null, args);
    }

    /**
     * Function for hook to set state if desired.
     *
     * @param {Object} nextState
     */

    function send(nextState) {
      updateRenderRecordState(record, nextState);
    }
  }

  /**
   * Update component instance state.
   */

  function updateRenderRecordState(record, nextState) {
    record.pendingState = assign(record.pendingState, nextState);
    record.dirty = true;
    invalidate();
  }

  /**
   * Commit props and state changes to an record.
   */

  function commit(record) {
    record.state = record.pendingState;
    record.props = record.pendingProps;
    record.pendingState = assign({}, record.state);
    record.pendingProps = assign({}, record.props);
    record.dirty = false;
  }

  /**
   * Try to avoid creating new virtual dom if possible.
   *
   * Later we may expose this so you can override, but not there yet.
   */

  function shouldUpdate(record) {
    if (!record.dirty) return false;
    var nextProps = record.pendingProps;
    var nextState = record.pendingState;
    var component = record.component;
    var prevProps = record.props;
    var prevState = record.state;
    var bool = component.shouldUpdate(prevProps, prevState, nextProps, nextState);
    return bool;
  };

  /**
   * Register an record.
   *
   * This is mostly to pre-preprocess component properties and values chains.
   *
   * The end result is for every component that gets mounted,
   * you create a set of IO nodes in the network from the `value` definitions.
   *
   * @param {Component} component
   */

  function register(record) {
    var component = record.component;
    // all renderRecords for this component type.
    var renderRecords = component.renderRecords = component.renderRecords || {};
    // add record to component list
    renderRecords[record.id] = record;

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
          var record = renderRecords[id];
          var changes = {};
          changes[prop] = data;
          var props = assign({}, record.props);
          props = assign(props, changes);
          record.pendingProps = assign(record.pendingProps, props);
          record.dirty = true;
          invalidate();
        };
      }
    });
  }

  function setDefaults(record) {
    var component = record.component;
    var map = component.valueToPropertyName;
    var component = record.component;
    var values = component.values;
    values.forEach(function(value){
      var name = map[value.id];
      if (null != record.pendingProps[name]) return;
      record.pendingProps[name] = value.get(); // get latest value plugged into io network
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
    var recordId = target.__record__;
    var eventType = event.type;

    // Walk up the DOM tree and see if there is a handler
    // for this event type higher up.
    while (target && target.__record__ === recordId) {
      var fn = keypath.get(app.handlers, [recordId, target.__path__, eventType]);
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

  function addEvent(recordId, path, eventType, fn) {
    keypath.set(app.handlers, [recordId, path, eventType], throttle(function(e){
      var record = app.renderRecords[recordId];
      fn.call(null, e, record.props, record.state);
    }));
  }

  /**
   * Unbind events for a recordId
   *
   * @param {String} recordId
   */

  function removeEvent(recordId, path, eventType) {
    keypath.del(app.handlers, [recordId, path, eventType]);
  }

  /**
   * Unbind all events from an record
   *
   * @param {RenderRecord} record
   */

  function removeAllEvents(record) {
    keypath.del(app.handlers, [record.id]);
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
