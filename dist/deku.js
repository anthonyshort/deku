!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.deku=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _require=="function"&&_require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _require=="function"&&_require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_require,module,exports){
exports.component = _require('./lib/component');
exports.dom = _require('./lib/virtual').node;
},{"./lib/component":2,"./lib/virtual":13}],2:[function(_require,module,exports){

/**
 * Module dependencies.
 */

var assign = _require('extend');
var Emitter = _require('component-emitter');
var statics = _require('./statics');
var protos = _require('./protos');
var dom = _require('../virtual').node;

/**
 * Expose `component`.
 */

module.exports = component;

/**
 * Generate a new `Component` constructor.
 *
 * @param {Object} spec
 * @return {Function} Component
 * @api public
 */

function component(spec) {
  spec = spec || {};

  // Alow just a render function.

  if (typeof spec === 'function') {
    spec = { render: spec };
  }

  /**
   * A component is a stateful virtual dom element.
   *
   * @api public
   */

  function Component() {
    if (!(this instanceof Component)) {
      return dom(Component, arguments[0], arguments[1]);
    }
    bindAll(this);
  }

  // statics.

  Component.props = {};
  Component.channels = [];
  assign(Component, statics, Emitter.prototype);

  // protos.

  assign(Component.prototype, protos, spec, Emitter.prototype);

  // for debugging.

  if (spec.displayName) {
    Component.displayName = spec.displayName;
    delete spec.displayName;
  }

  // extract props

  if (spec.props) {
    for (var key in spec.props) {
      Component.prop(key, spec.props[key]);
    }
    delete spec.props;
  }

  // extract channels

  if (spec.channels) {
    spec.channels.forEach(function(name){
      Component.channel(name);
    });
    delete spec.channels;
  }

  return Component;
}

/**
 * Bind all functions on an object to the object
 */

function bindAll(obj) {
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'function') obj[key] = val.bind(obj);
  }
  return obj;
}
},{"../virtual":13,"./protos":3,"./statics":4,"component-emitter":22,"extend":26}],3:[function(_require,module,exports){

/**
 * Module dependencies.
 */

var assign = _require('extend');

/**
 * Set properties on `this.state`.
 *
 * @param {Object} state State to merge with existing state.
 * @param {Function} done
 */

exports.setState = function(state, done){
  this.emit('change', state, done);
};

/**
 * Invalidate the component so that it is updated on the next
 * frame regardless of whether or not the state has changed.
 *
 * This sets a temporary state value that is checked and trigger
 * an update. This special property is removed after the component is
 * updated.
 *
 * @return {void}
 */

exports.invalidate = function(){
  this.emit('change', { __force__: true });
};

/**
 * Default render. Renders a noscript tag by
 * default so nothing shows up in the DOM.
 *
 * @param {node} dom
 * @return {Node}
 */

exports.render = function(){
  return null;
};

/**
 * Return the initial state of the component.
 * This should be overriden.
 *
 * @return {Object}
 */

exports.initialState = function(){
  return {};
};

/**
 * Called before the component is mounted in the DOM. This is
 * also called when rendering the component to a string
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.beforeMount = function(el, state, props){

};

/**
 * Called after the component is mounted in the DOM. This is use
 * for any setup that needs to happen, like starting timers.
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.afterMount = function(el, state, props){

};

/**
 * Called before the component is re-rendered
 *
 * @param {Object} state
 * @param {Object} props
 * @param {Object} nextState
 * @param {Object} nextProps
 *
 * @return {void}
 */

exports.beforeUpdate = function(state, props, nextState, nextProps){

};

/**
 * Called after the component is mounted in the DOM. This is use
 * for any setup that needs to happen, like starting timers.
 *
 * @param {Object} state
 * @param {Object} props
 * @param {Object} prevState
 * @param {Object} prevProps
 *
 * @return {void}
 */

exports.afterUpdate = function(state, props, prevState, prevProps){

};

/**
 * Called before the component is unmounted from the DOM
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.beforeUnmount = function(el, state, props){

};

/**
 * Called after the component is unmounted in the DOM
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.afterUnmount = function(el, state, props){

};

/**
 * Called after the props have been updated.
 *
 * @param {Object} nextProps
 */

exports.propsChanged = function(nextProps){

};
},{"extend":26}],4:[function(_require,module,exports){

/**
 * Module dependencies.
 */

var renderString = _require('../renderer/string');
var Entity = _require('../entity');
var Scene = _require('../scene');

/**
 * Browser dependencies.
 */

if (typeof window !== 'undefined') {
  var HTMLRenderer = _require('../renderer/html');
}

/**
 * Use plugin.
 *
 * @param {Function|Object} plugin Passing an object will extend the prototype.
 * @return {Component}
 * @api public
 */

exports.use = function(plugin){
  if ('function' === typeof plugin) {
    plugin(this);
  } else {
    for (var k in plugin) this.prototype[k] = plugin[k];
  }
  return this;
};

/**
 * Define a property
 *
 * @param {String} name
 * @param {Object} options
 */

exports.prop = function(name, options){
  this.props[name] = options;
  return this;
};

/**
 * Connect to channels
 *
 * @param {String} name
 */

exports.channel = function(name){
  this.channels.push(name);
  return this;
};

/**
 * Mount this component to a node. Only available
 * in the browser as it requires the DOM.
 *
 * @param {HTMLElement} container
 * @param {Object} props
 */

exports.render = function(container, props){
  if (!HTMLRenderer) throw new Error('You can only render a DOM tree in the browser. Use renderString instead.');
  var renderer = new HTMLRenderer(container);
  var entity = new Entity(this, props);
  var scene = new Scene(renderer, entity);
  return scene;
};

/**
 * Render this component to a string.
 *
 * @param {Object} props
 */

exports.renderString = function(props){
  var entity = new Entity(this, props);
  return renderString(entity);
};

},{"../entity":5,"../renderer/html":7,"../renderer/string":9,"../scene":10}],5:[function(_require,module,exports){

/**
 * Module dependencies.
 */

var Emitter = _require('component-emitter');
var each = _require('component-each');
var camel = _require('to-camel-case');
var virtual = _require('../virtual');
var assign = _require('extend');
var equals = _require('equals');
var uid = _require('get-uid');

/**
 * Expose `Entity`.
 */

module.exports = Entity;

/**
 * A rendered component instance.
 *
 * This manages the lifecycle, props and state of the component.
 *
 * @param {Function} Component
 * @param {Object} props
 */

function Entity(Component, props) {
  this.id = uid();
  this.type = Component;
  this.props = props || {};
  this.component = this.createComponent(Component);
  this.state = this.component.initialState(this.props);
  this.children = {};
  this.current = null;
  this.previous = null;
  this.dirty = false;
  this.lifecycle = null;
  this._pendingProps = null;
  this._pendingState = null;
  this._propsReplaced = false;
}

/**
 * Entity is an emitter.
 */

Emitter(Entity.prototype);

/**
 * Create the component instance
 *
 * @param {Component} Component
 *
 * @return {Object}
 */

Entity.prototype.createComponent = function(Component) {
  var component = new Component();
  component.on('change', this.setState.bind(this));
  return component;
};

/**
 * Get an updated version of the virtual tree.
 *
 * @return {VirtualTree}
 */

Entity.prototype.render = function(){
  this.lifecycle = 'rendering';
  var props = this.getProps();
  var node = this.component.render(props, this.state);
  this.lifecycle = null;
  if (!node) {
    node = virtual.node('noscript');
  }
  return virtual.tree(node);
};

/**
 * Set the props.
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

Entity.prototype.setProps = function(nextProps, done){
  if (done) this.once('update', done);
  this._pendingProps = assign(this._pendingProps || {}, nextProps);
  this.propsChanged(nextProps);
  this.invalidate();
};

/**
 * Replace all the properties
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

Entity.prototype.replaceProps = function(nextProps, done){
  if (done) this.once('update', done);
  this._propsReplaced = true;
  this._pendingProps = nextProps;
  this.propsChanged(nextProps);
  this.invalidate();
};


Entity.prototype.validateProps = function(){
  var props = this.type.props;
  // if they've added a prop not in the definitions
  // if they've missed a prop in the definition
  // if they've sent the wrong type for a prop
};

/**
 * Set the state. This can be called multiple times
 * and the state will be MERGED.
 *
 * @param {Object} nextState
 * @param {Function} done
 */

Entity.prototype.setState = function(nextState, done){
  if (this.lifecycle === 'beforeUpdate') {
    throw new Error('You can\'t call setState in the beforeUpdate hook. Use the propsChanged hook instead.');
  }
  if (this.lifecycle === 'rendering') {
    throw new Error('You can\'t call setState in the render hook. This method must remain pure.');
  }
  if (done) this.once('update', done);
  this._pendingState = assign(this._pendingState || {}, nextState);
  this.invalidate();
};

/**
 * Schedule this component to be updated on the next frame.
 */

Entity.prototype.invalidate = function(){
  this.dirty = true;
  if (this.scene) this.scene.dirty = true;
};

/**
 * Add an entity as a child of this entity
 *
 * @param {String} path
 * @param {Entity} entity
 */

Entity.prototype.addChild = function(path, Component, props){
  var child = new Entity(Component, props);
  this.children[path] = child;
  child.addToScene(this.scene);
  return child;
};

/**
 * Get the child entity at a path
 *
 * @param {String} path
 *
 * @return {Entity}
 */

Entity.prototype.getChild = function(path) {
  return this.children[path];
};

/**
 * Get the path of a node in it's current tree
 *
 * @param {Node} node
 *
 * @return {String}
 */

Entity.prototype.getPath = function(node) {
  return this.current.getPath(node);
};

/**
 * Add this entity to a Scene. Whenever this entity
 * is changed, it will mark the scene as dirty.
 *
 * @param {Scene} scene
 */

Entity.prototype.addToScene = function(scene){
  this.scene = scene;
};

/**
 * Remove an entity from this component and return it.
 *
 * @param {String} path
 *
 * @return {Entity}
 */

Entity.prototype.removeChild = function(path){
  var entity = this.children[path];
  entity.scene = null;
  delete this.children[path];
  return entity;
};

/**
 * Should this entity be updated and rendered?
 *
 * @param {Object} nextState
 * @param {Object} nextProps
 *
 * @return {Boolean}
 */

Entity.prototype.shouldUpdate = function(nextState, nextProps){
  if (nextProps && !equals(nextProps, this.props)) {
    return true;
  }
  if (nextState && !equals(nextState, this.state)) {
    return true;
  }
  return false;
};

/**
 * Update the props on the component.
 *
 * @return {Node}
 */

Entity.prototype.update = function(){
  var nextProps;

  // If we've flagged that we want all of the props replaced, we
  // won't merge it in, we'll replace it entirely.
  if (this._propsReplaced) {
    nextProps = this._pendingProps;
    this._propsReplaced = false;
  } else {
    nextProps = assign({}, this.props, this._pendingProps);
  }

  var nextState = assign({}, this.state, this._pendingState);

  // Compare the state and props to see if we really need to render
  if (!this.shouldUpdate(nextState, nextProps)) return false;

  // pre-update. This callback could mutate the
  // state or props just before the render occurs
  this.beforeUpdate(nextState, nextProps);

  // commit the changes.
  var previousState = this.state;
  var previousProps = this.props;
  this.state = nextState;
  this.props = nextProps || this.props;

  // reset.
  this._pendingState = null;
  this._pendingProps = null;

  // remove the force flag.
  delete this.state.__force__;

  // Signal that something changed
  return true;
};

/**
 * Set the current version of the tree and mark this
 * entity as not dirty. This is called once the entity
 * has been rendered/updated on the scene.
 *
 * @param {Tree} tree
 */

Entity.prototype.setCurrent = function(tree){
  this.previous = this.current;
  this.current = tree;
  this.dirty = false;
};

/**
 * Remove the component from the DOM.
 */

Entity.prototype.remove = function(){
  this.off();
  each(this.children, function(path, child){
    child.remove();
  });
  this.children = {};
};

/**
 * Connect to all off the channels on the scene
 */

Entity.prototype.connect = function(){
  var channels = this.channels = {};
  var scene = this.scene;
  this.type.channels.forEach(function(name){
    var socket = scene.channel(name).connect();
    channels[camel(name)] = socket;
  });
};

/**
 * Disconnect from all of the channels
 */

Entity.prototype.disconnect = function(){
  for (var name in this.channels) {
    var socket = this.channels[name];
    socket.disconnect();
  }
  delete this.channels;
};

/**
 * Get the props object that is passed into the hook functions.
 * This includes extra props that are sent to the user but
 * don't necessarily update the view.
 *
 * @return {Object}
 */

Entity.prototype.getProps = function(){
  var props = Object.create(this.props);
  props.channels = this.channels;
  return props;
};

/**
 * Trigger `beforeUpdate` lifecycle hook.
 *
 * @param {Object} nextState
 * @param {Object} nextProps
 */

Entity.prototype.beforeUpdate = function(nextState, nextProps){
  var props = this.getProps();
  this.lifecycle = 'beforeUpdate';
  this.component.beforeUpdate(props, this.state, nextProps, nextState);
  this.type.emit('beforeUpdate', this.component, props, this.state, nextProps, nextState);
  this.lifecycle = null;
};

/**
 * Trigger `afterUpdate` lifecycle hook.
 *
 * @param {Object} previousState
 * @param {Object} previousProps
 */

Entity.prototype.afterUpdate = function(previousState, previousProps){
  var props = this.getProps();
  this.emit('update');
  this.component.afterUpdate(props, this.state, previousProps, previousState);
  this.type.emit('afterUpdate', this.component, props, this.state, previousProps, previousState);
};

/**
 * Trigger `beforeUnmount` lifecycle hook.
 *
 * @param {HTMLElement} el
 */

Entity.prototype.beforeUnmount = function(el){
  var props = this.getProps();
  this.component.beforeUnmount(el, props, this.state);
  this.type.emit('beforeUnmount', this.component, el, props, this.state);
};

/**
 * Trigger `afterUnmount` lifecycle hook.
 */

Entity.prototype.afterUnmount = function(){
  this.disconnect();
  var props = this.getProps();
  this.component.afterUnmount(props, this.state);
  this.type.emit('afterUnmount', this.component, props, this.state);
};

/**
 * Trigger `beforeMount` lifecycle hook.
 */

Entity.prototype.beforeMount = function(){
  this.connect();
  var props = this.getProps();
  this.component.beforeMount(props, this.state);
  this.type.emit('beforeMount', this.component, props, this.state);
};

/**
 * Trigger `afterMount` lifecycle hook.
 *
 * @param {HTMLElement} el
 */

Entity.prototype.afterMount = function(el){
  var props = this.getProps();
  this.component.afterMount(el, props, this.state);
  this.type.emit('afterMount', this.component, el, props, this.state);
};

/**
 * Trigger `propsChanged` lifecycle hook.
 *
 * @param {Object} nextProps
 */

Entity.prototype.propsChanged = function(nextProps){
  var props = this.getProps();
  this.component.propsChanged(nextProps, props, this.state);
  this.type.emit('propsChanged', this.component, nextProps, props, this.state);
};
},{"../virtual":13,"component-each":18,"component-emitter":22,"equals":24,"extend":26,"get-uid":27,"to-camel-case":36}],6:[function(_require,module,exports){

var equals = _require('equals');

module.exports = patch;

/**
 * Create a patch function from a diff.
 *
 * @param {ComponentRenderer} this The this component
 */

function patch(entity, nextTree, el, renderer){
  var context = {
    entity: entity,
    nextTree: nextTree,
    renderer: renderer,
    rootEl: el,
    el: el,
    path: '0',
    id: entity.id,
    isRoot: true
  };
  diffNode(entity.current.root, nextTree.root, context);
  return context.rootEl;
}

/**
 * Create a diff between two tress of nodes.
 */

 function diffNode(current, next, context){
  // Type changed. This could be from element->text, text->ComponentA,
  // ComponentA->ComponentB etc. But NOT div->span. These are the same type
  // (ElementNode) but different tag name.
  if (current.type !== next.type) {
    return replaceNode(current, next, context);
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

    // this is a new node.
    if (left == null) {
      context.renderer.createElement(right, context.nextTree, context.entity, el);
      continue;
    }

    // the node has been removed.
    if (right == null) {
      removeComponents(left, context);
      if ('component' != left.type) {
        el.removeChild(el.childNodes[j]);
      }
      j = j - 1;
      continue;
    }

    diffNode(left, right, {
      el: el.childNodes[j],
      entity: context.entity,
      nextTree: context.nextTree,
      renderer: context.renderer,
      isRoot: false,
      path: context.path + '.' + j
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
      if (name === "value") {
        context.el.value = value;
      } else {
        context.el.setAttribute(name, value);
      }
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
 * Update a component with the props from the current node.
 *
 * @param {Node} previous
 * @param {Node} current
 * @param {Object} context
 */

function diffComponent(previous, current, context){
  // if the component type has changed, remove the
  // component and create the new one.
  if (current.component !== previous.component) {
    return replaceNode(previous, current, context);
  }

  var entity = context.entity.getChild(context.path);

  // The props are different, replace them
  // if (!equals(current.props, entity.props)) {
  //   entity.replaceProps(current.props);
  // }

  entity.replaceProps(current.props);
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
    return replaceNode(previous, current, context);
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

/**
 * Replace a node in the previous tree with the node
 * in another tree. It will remove all the components
 * beneath that node and create all new components within
 * the current node and assign them to this this.
 *
 * @param {Node} previous
 * @param {Node} current
 */

function replaceNode(current, next, context){
  var el = context.el;
  var container = el.parentNode;
  removeComponents(current, context);
  // Check for parent node in case child root node is a component
  if (el.parentNode) el.parentNode.removeChild(el);
  var newEl = context.renderer.createElement(next, context.nextTree, context.entity);
  container.insertBefore(newEl, container.childNodes[current.index]);
  if (context.isRoot) context.rootEl = newEl;
}

/**
 * Remove all components within a node.
 *
 * @param {ComponentRenderer} this
 * @param {Node} node
 */

function removeComponents(node, context){
  // remove a child component
  if (node.type === 'component') {
    var path = context.entity.current.getPath(node);
    var child = context.entity.removeChild(path);
    context.renderer.unmountEntity(child);
    return;
  }
  // recursively remove components
  if (node.children) {
    node.children.forEach(function(childNode){
      removeComponents(childNode, context);
    }, this);
  }
}

/**
 * Zip multiple arrays together into one array.
 *
 * @return {Array}
 */

function zip() {
  var args = Array.prototype.slice.call(arguments, 0);
  return args.reduce(function(a, b){
    return a.length > b.length ? a : b;
  }, []).map(function(_, i){
    return args.map(function(arr){
      return arr[i];
    });
  });
}

},{"equals":24}],7:[function(_require,module,exports){

/**
 * Dependencies.
 */

var Interactions = _require('./interactions');
var each = _require('component-each');
var patch = _require('./diff');

/**
 * Export.
 */

module.exports = HTMLRenderer;

/**
 * Handles the rendering of a scene graph by running
 * diffs on the current virtual tree of the entities with
 * the previous version. It then applies this diff to the
 * acutal DOM tree.
 *
 * Instead of using SceneNodes or some other object type, we're
 * just using the entities themselves, since each SceneNode can only
 * have a single entity anyway. In the future we could split these up, but
 * it seems simpler to do it this way for now.
 */

function HTMLRenderer(container) {
  this.container = container;
  this.events = new Interactions(container);
  this.elements = {};
  this.rendered = null;
}

/**
 * Render an entity tree. This should be called on the top
 * level entity that is mounted to the container.
 *
 * @param {Entity} entity
 *
 * @api public
 */

HTMLRenderer.prototype.render = function(entity) {

  if (entity.current) {
   this.update(entity);
   return;
  }

  // This entity has never been rendered before
  this.clear();
  this.mountEntity(entity, this.container);
  this.rendered = entity;
};

/**
 * Update an entity already on the scene.
 *
 * @param {Entity} entity
 *
 * @api private
 * @return {void}
 */

HTMLRenderer.prototype.update = function(entity) {

  // Does this entity even need updating?
  if (!entity.dirty) {
    return this.updateChildren(entity);
  }

  var previousState = entity.state;
  var previousProps = entity.props;
  var updated = entity.update();

  // TODO: Use an event to call all of this.
  // This will allow us to call of the lifecycle
  // events from within the entity.

  // The props/state were the same
  if (!updated) {
    return this.updateChildren(entity);
  }

  var nextTree = entity.render();

  // Run the diff and patch the element.
  var rootEl = patch(entity, nextTree, this.getElement(entity.id), this);

  // Update the element for this component in case
  // the root node has changed.
  this.elements[entity.id] = rootEl;

  // Commit the changes.
  entity.setCurrent(nextTree);
  this.updateEvents(entity);
  this.updateChildren(entity);
  entity.afterUpdate(previousState, previousProps);
};

/**
 * Update all the children of an entity
 *
 * @param {Entity} entity
 */

HTMLRenderer.prototype.updateChildren = function(entity) {
  for (var key in entity.children) {
    this.update(entity.children[key]);
  }
};

/**
 * Clear the scene
 *
 * @return {void}
 */

HTMLRenderer.prototype.clear = function(){
  if (!this.rendered) return;
  this.unmountEntity(this.rendered);
  this.rendered = null;
};

/**
 * Clear the scene
 */

HTMLRenderer.prototype.remove = function(){
  this.clear();
  this.events.remove();
};

/**
 * Append an entity to an element
 *
 * @param {Entity} entity
 * @param {HTMLElement} container
 *
 * @return {HTMLElement}
 */

HTMLRenderer.prototype.mountEntity = function(entity, container) {
  entity.beforeMount();
  var el = this.addEntity(entity);
  if (entity.props.isRoot) {
    this.container.appendChild(el);
  } else {
    container.appendChild(el);
  }
  this.updateEvents(entity);
  entity.afterMount(el);
  return el;
};

/**
 * Remove the entity from the DOM.
 *
 * @param {Entity} entity
 */

HTMLRenderer.prototype.unmountEntity = function(entity){
  var el = this.getElement(entity.id);

  // This entity is already unmounted
  if (!el) return;

  entity.beforeUnmount(el);

  // If sub-components are on the root node, the entities will share
  // the same element. In this case, the element will only need to be
  // removed from the DOM once
  if (el.parentNode) el.parentNode.removeChild(el);
  this.unmountChildren(entity);
  this.removeEvents(entity);
  entity.afterUnmount();
  entity.remove();
  delete this.elements[entity.id];
};

/**
 * Remove all of the child entities of an entity
 *
 * @param {Entity} entity
 */

HTMLRenderer.prototype.unmountChildren = function(entity) {
  var self = this;
  each(entity.children, function(path, child){
    entity.removeChild(path);
    self.unmountEntity(child);
  });
};

/**
 * Get the element for an entity using the entity ID
 *
 * @param {String} id
 *
 * @return {HTMLElement}
 */

HTMLRenderer.prototype.getElement = function(id) {
  return this.elements[id];
};

/**
 * Updates all the DOM event bindings for an entity.
 * It removes all event bindings on the scene for this entity
 * first and just reapplies them using the current tree.
 *
 * @return {void}
 */

HTMLRenderer.prototype.updateEvents = function(entity) {
  var self = this;
  this.events.unbind(entity.id);

  // TODO: Optimize this by storing the events in the Tree
  // object on the initial pass instead of looping again.
  // eg. entity.current.events -> '0.0.1:click': fn
  each(entity.current.nodes, function(path, node){
    if (node.type !== 'element') return;
    each(node.events, function(eventType, fn){
      self.events.bind(entity.id, path, eventType, function(e){
        fn.call(entity.component, e, entity.props, entity.state);
      });
    });
  });
};

/**
 * Unbind all events from an entity
 *
 * @param {Entity} entity
 */

HTMLRenderer.prototype.removeEvents = function(entity) {
  this.events.unbind(entity.id);
};

/**
 * Render an entity as a HTML element
 *
 * @param {Entity} entity
 *
 * @return {HTMLElement}
 */

HTMLRenderer.prototype.addEntity = function(entity, parentEl) {
  var current = entity.render();
  var el = this.createElement(current.root, current, entity, parentEl);
  entity.setCurrent(current);
  this.elements[entity.id] = el;
  // entity.on('update', this.updateEntity);
  // entity.on('remove', this.unmountEntity);
  return el;
};

/**
 * Convert this node and all it's children into
 * real DOM elements and return it.
 *
 * Passing in a node allows us to render just a small
 * part of the tree instead of the whole thing, like when
 * a new branch is added during a diff.
 *
 * @param {Node} node
 * @param {Tree} tree
 * @param {Entity} entity
 * @param {HTMLElement} parentEl
 *
 * @return {HTMLElement}
 */

HTMLRenderer.prototype.createElement = function(node, tree, entity, optParentEl){
  var path = tree.getPath(node);
  var parentEl = optParentEl || document.createDocumentFragment();

  // we can only render nodes that exist within the tree.
  if (!path) throw new Error('Node does not exist in the entity');

  if (node.type === 'text') {
    parentEl.appendChild(document.createTextNode(node.data));
    return parentEl;
  }

  if (node.type === 'element') {
    var el = document.createElement(node.tagName);
    var children = node.children;

    for (var name in node.attributes) {
      el.setAttribute(name, node.attributes[name]);
    }

    // store the path for event delegation.
    el.__path__ = path;
    el.__entity__ = entity.id;

    // add children.
    for (var i = 0, n = children.length; i < n; i++) {
      this.createElement(children[i], tree, entity, el);
    }

    // TODO: Store nodes in a hash so we can easily find
    // elements later. This would allow us to separate out the
    // patching from the diffing will still being efficient. We could
    // also use the same object in the Interactions object to make
    // lookups cleaner instead of checking __ values.
    // this.nodesByPath[entity.id][path] = el;

    parentEl.appendChild(el);
    return el;
  }

  if (node.type === 'component') {
    var child = entity.addChild(path, node.component, node.props);
    return this.mountEntity(child, parentEl);
  }
};

},{"./diff":6,"./interactions":8,"component-each":18}],8:[function(_require,module,exports){

var throttle = _require('per-frame');
var keypath = _require('object-path');

/**
 * All of the events we will bind to
 */

var events = [
  'blur',
  'change',
  'click',
  'contextmenu',
  'copy',
  'cut',
  'dblclick',
  'drag',
  'dragend',
  'dragenter',
  'dragexit',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  'focus',
  'input',
  'keydown',
  'keyup',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'paste',
  'scroll',
  'submit',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'wheel'
];

/**
 * Expose `Interactions`.
 */

module.exports = Interactions;

/**
 * Handle events for a component.
 *
 * @param {HTMLElement} el
 */

function Interactions(el) {
  this.el = el;
  this.handlers = {};
  this.handle = this.handle.bind(this);
  this.resume();
}

/**
 * Bind events for an element, and all it's rendered child elements.
 *
 * @param {String} path
 * @param {String} event
 * @param {Function} fn
 */

Interactions.prototype.bind = function(namespace, path, event, fn){
  keypath.set(this.handlers, [namespace, path, event], throttle(fn));
};

/**
 * Unbind events for a namespace
 *
 * @param {String} namespace
 */

Interactions.prototype.unbind = function(namespace){
  delete this.handlers[namespace];
};

/**
 * Start listening for events
 */

Interactions.prototype.resume = function(){
  events.forEach(function(name){
    this.el.addEventListener(name, this.handle, true);
  }, this);
};

/**
 * Stop listening for events
 */

Interactions.prototype.pause = function(){
  events.forEach(function(name){
    this.el.removeEventListener(name, this.handle, true);
  }, this);
};

/**
 * After render, finally bind event listeners.
 */

Interactions.prototype.remove = function(){
  this.handlers = {};
  this.pause();
};

/**
 * Handle an event that has occured within the container
 *
 * @param {Event} event
 */

Interactions.prototype.handle = function(event){
  var target = event.target;
  var handlers = this.handlers;
  var entityId = target.__entity__;
  var eventType = event.type;

  // Walk up the DOM tree and see if there is a handler
  // for this event type higher up.
  while (target && target.__entity__ === entityId) {
    var fn = keypath.get(handlers, [entityId, target.__path__, eventType]);
    if (fn) {
      event.delegateTarget = target;
      fn(event);
      break;
    }
    target = target.parentNode;
  }
};

},{"object-path":28,"per-frame":29}],9:[function(_require,module,exports){
var virtual = _require('../../virtual');
var Entity = _require('../../entity');

/**
 * Export
 */

module.exports = render;

/**
 * Render a component to a string
 *
 * @param {Entity}
 *
 * @return {String}
 */

function render(entity) {
  var tree = entity.render();
  return nodeToString(tree.root, tree);
}

/**
 * Render a node to a string
 *
 * @param {Node} node
 * @param {Tree} tree
 *
 * @return {String}
 */

function nodeToString(node, tree) {
  var path = tree.getPath(node);

  // text
  if (node.type === 'text') {
    return node.data;
  }

  // element
  if (node.type === 'element') {
    var children = node.children;
    var attributes = node.attributes;
    var tagName = node.tagName;
    var str = '<' + tagName + attrs(attributes) + '>';

    for (var i = 0, n = children.length; i < n; i++) {
      str += nodeToString(children[i], tree);
    }
    str += '</' + tagName + '>';
    return str;
  }

  // component
  if (node.type === 'component') {
    return render(new Entity(node.component, node.props));
  }

  throw new Error('Invalid type');
}

/**
 * HTML attributes to string.
 *
 * @param {Object} attributes
 * @return {String}
 * @api private
 */

function attrs(attributes) {
  var str = '';
  for (var key in attributes) {
    str += attr(key, attributes[key]);
  }
  return str;
}

/**
 * HTML attribute to string.
 *
 * @param {String} key
 * @param {String} val
 * @return {String}
 * @api private
 */

function attr(key, val) {
  return ' ' + key + '="' + val + '"';
}

},{"../../entity":5,"../../virtual":13}],10:[function(_require,module,exports){

/**
 * Module dependencies
 */

var Emitter = _require('component-emitter');
var Signals = _require('tower-channels');
var loop = _require('raf-loop');

/**
 * Expose `Scene`
 *
 * @type {Function}
 */

module.exports = Scene;

/**
 * A scene renders a component tree to an element
 * and manages the lifecycle and events each frame.
 *
 * @param {HTMLElement} container
 * @param {Entity} entity
 */

function Scene(renderer, entity) {
  this.loop = loop(this.update.bind(this));
  this.signals = new Signals();
  this.renderer = renderer;
  this.dirty = true;
  this.entity = entity;
  entity.addToScene(this);
  this.resume();
}

Emitter(Scene.prototype);

/**
 * Add a plugin
 *
 * @api public
 */

Scene.prototype.use = function(plugin){
  plugin(this);
  return this;
};

/**
 * Get a channel
 *
 * @param {String} name
 *
 * @return {Emitter}
 */

Scene.prototype.channel = function(name){
  return this.signals.channel(name);
};

/**
 * Schedule this component to be updated on the next frame.
 *
 * @param {Function} done
 * @return {void}
 */

Scene.prototype.update = function(){
  if (!this.dirty) return;
  this.dirty = false;
  this.renderer.render(this.entity);
  this.emit('update');
  return this;
};

/**
 * Set new props on the component and trigger a re-render.
 *
 * @param {Object} newProps
 * @param {Function} [done]
 */

Scene.prototype.setProps = function(newProps, done){
  if (done) this.once('update', done);
  this.entity.setProps(newProps);

  // Return a promise if the environment
  // supports the native version.
  var self = this;
  if (typeof Promise !== 'undefined') {
    return new Promise(function(resolve){
      self.once('update', function(){
        resolve();
      });
    });
  }
};

/**
 * Replace all the props on the current entity
 *
 * @param {Objct} newProps
 * @param {Function} done
 *
 * @return {Promise}
 */

Scene.prototype.replaceProps = function(newProps, done){
  if (done) this.once('update', done);
  this.entity.replaceProps(newProps);

  // Return a promise if the environment
  // supports the native version.
  var self = this;
  if (typeof Promise !== 'undefined') {
    return new Promise(function(resolve){
      self.once('update', function(){
        resolve();
      });
    });
  }
};

/**
 * Remove the scene from the DOM.
 */

Scene.prototype.remove = function(){
  this.pause();
  this.signals.closeAll();
  this.renderer.remove();
  this.off();
};

/**
 * Resume updating the scene
 */

Scene.prototype.resume = function(){
  this.loop.start();
  this.emit('resume');
  return this;
};

/**
 * Stop updating the scene
 */

Scene.prototype.pause = function(){
  this.loop.stop();
  this.emit('pause');
  return this;
};
},{"component-emitter":22,"raf-loop":31,"tower-channels":39}],11:[function(_require,module,exports){

/**
 * Initialize a new `ComponentNode`.
 *
 * @param {Component} component
 * @param {Object} props
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual nodes
 * @api public
 */

module.exports = function(component, props, key, children) {
  var node = {};
  node.key = key;
  node.props = props;
  node.type = 'component';
  node.component = component;
  node.props.children = children || [];
  return node;
};

},{}],12:[function(_require,module,exports){
var type = _require('component-type');

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
 * Initialize a new `ElementNode`.
 *
 * @param {String} tagName
 * @param {Object} attributes
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual dom nodes.
 * @api public
 */

module.exports = function(tagName, attributes, key, children) {
  var node = {};
  node.type = 'element';
  node.attributes = parseAttributes(attributes);
  node.events = parseEvents(attributes);
  node.tagName = parseTag(tagName, attributes);
  node.children = children || [];
  node.key = key;
  return node;
};

/**
 * Parse attributes for some special cases.
 *
 * TODO: This could be more functional and allow hooks
 * into the processing of the attributes at a component-level
 *
 * @param {Object} attributes
 *
 * @return {Object}
 */

function parseAttributes(attributes) {

  // style: { 'text-align': 'left' }
  if (attributes.style) {
    attributes.style = parseStyle(attributes.style);
  }

  // data: { foo: 'bar' }
  if (attributes.data) {
    attributes = parseData(attributes);
  }

  // class: { foo: true, bar: false, baz: true }
  // class: ['foo', 'bar', 'baz']
  if (attributes.class) {
    attributes.class = parseClass(attributes.class);
  }

  // Remove attributes with false values
  for (var name in attributes) {
    if (attributes[name] === false) {
      delete attributes[name];
    }
  }

  return attributes;
}

/**
 * Parse a block of styles into a string.
 *
 * TODO: this could do a lot more with vendor prefixing,
 * number values etc. Maybe there's a way to allow users
 * to hook into this?
 *
 * @param {Object} styles
 *
 * @return {String}
 */

function parseStyle(styles) {
  if (type(styles) !== 'object') {
    return styles;
  }
  var str = '';
  for (var name in styles) {
    var value = styles[name];
    str += name + ':' + value + ';';
  }
  return str;
}

/**
 * Parse the dataset
 *
 * @param {Object} attributes
 *
 * @return {Object}
 */

function parseData(attributes) {
  if (type(attributes.data) !== 'object') {
    return attributes;
  }

  for (var name in attributes.data) {
    attributes['data-' + name] = attributes.data[name];
  }

  delete attributes.data;
  return attributes;
}

/**
 * Parse the class attribute so it's able to be
 * set in a more user-friendly way
 *
 * @param {String|Object|Array} value
 *
 * @return {String}
 */

function parseClass(value) {

  // { foo: true, bar: false, baz: true }
  if (type(value) === 'object') {
    var matched = [];
    for (var key in value) {
      if (value[key]) matched.push(key);
    }
    value = matched;
  }

  // ['foo', 'bar', 'baz']
  if (type(value) === 'array') {
    if (value.length === 0) {
      return;
    }
    value = value.join(' ');
  }

  return value;
}

/**
 * Events are stored on the node and are creating using
 * special attributes
 *
 * @param {Object} attributes
 *
 * @return {Object}
 */

function parseEvents(attributes) {
  var ret = {};
  for (var name in events) {
    var type = events[name];
    var callback = attributes[name];
    if (callback) {
      ret[type] = callback;
      delete attributes[name];
    }
  }
  return ret;
}

/**
 * Parse the tag to allow using classes and ids
 * within the tagname like in CSS.
 *
 * @param {String} name
 * @param {Object} attributes
 *
 * @return {String}
 */

function parseTag(name, attributes) {
  if (!name) return 'div';

  var parts = name.split(/([\.#]?[a-zA-Z0-9_:-]+)/);
  var tagName = 'div';

  parts
    .filter(Boolean)
    .forEach(function(part, i){
      var type = part.charAt(0);
      if (type === '.') {
        attributes.class = ((attributes.class || '') + ' ' + part.substring(1, part.length)).trim();
      } else if (type === '#') {
        attributes.id = part.substring(1, part.length);
      } else {
        tagName = part;
      }
    });

  return tagName;
}
},{"component-type":23}],13:[function(_require,module,exports){

/**
 * Module dependencies.
 */

var ComponentNode = _require('./component');
var ElementNode = _require('./element');
var TextNode = _require('./text');
var tree = _require('./tree');
var uid = _require('get-uid');

/**
 * Exports.
 */

exports.node = dom;
exports.tree = tree;

/**
 * Create virtual DOM trees.
 *
 * This creates the nicer API for the user.
 * It translates that friendly API into an actual tree of nodes.
 *
 * @param {String|Function} type
 * @param {Object} props
 * @param {Array} children
 * @return {Node}
 * @api public
 */

function dom(type, props, children) {

  // Skipped adding attributes and we're passing
  // in children instead.
  if (arguments.length === 2 && (typeof props === 'string' || Array.isArray(props))) {
    children = props;
    props = {};
  }

  children = children || [];
  props = props || {};

  // passing in a single child, you can skip
  // using the array
  if (!Array.isArray(children)) {
    children = [ children ];
  }

  children = children.map(normalize);

  // pull the key out from the data.
  var key = props.key;
  delete props.key;

  // if you pass in a function, it's a `Component` constructor.
  // otherwise it's an element.
  var node;
  if ('function' == typeof type) {
    node = ComponentNode(type, props, key, children);
  } else {
    node = ElementNode(type, props, key, children);
  }

  // set the unique ID
  node.id = uid();

  return node;
}

/**
 * Parse nodes into real `Node` objects.
 *
 * @param {Mixed} node
 * @param {Integer} index
 * @return {Node}
 * @api private
 */

function normalize(node, index) {
  if (typeof node === 'string' || typeof node === 'number') {
    node = TextNode(String(node));
  }
  if (Array.isArray(node)) {
    throw new Error('Child node cant be an array. This can happen if you try to use props.children like a node.');
  }
  node.index = index;
  return node;
}

},{"./component":11,"./element":12,"./text":14,"./tree":15,"get-uid":27}],14:[function(_require,module,exports){

/**
 * Initialize a new `TextNode`.
 *
 * This is just a virtual HTML text object.
 *
 * @param {String} text
 * @api public
 */

module.exports = function(text) {
  var node = {};
  node.type = 'text';
  node.data = String(text);
  return node;
};
},{}],15:[function(_require,module,exports){

/**
 * Export `Tree`.
 */

module.exports = function(node) {
  return new Tree(node);
};

/**
 * A tree is representation of Node that is easier
 * to parse and diff. The tree should be considered
 * immutable and won't change.
 *
 * @param {Node} node
 */

function Tree(node) {
  this.root = node;
  this.paths = {};
  this.nodes = {};
  this.components = {};
  this.parse(node);
}

/**
 * Get the path for a node.
 *
 * @param {Node} node
 * @return {String}
 */

Tree.prototype.getPath = function(node){
  return this.paths[node.id];
};

/**
 * Get the node at a path
 *
 * @param {String} path
 *
 * @return {Node}
 */

Tree.prototype.getNode = function(path){
  return this.nodes[path];
};

/**
 * Parse a Node into a hash table. This allows
 * us to quickly find the path for a node and to
 * find a node at any path.
 *
 * @param {Node} node
 * @param {String} path
 * @return {Object}
 */

Tree.prototype.parse = function(node, path){
  path = path || '0';
  this.paths[node.id] = path;
  this.nodes[path] = node;
  if (node.type === 'component') {
    this.components[path] = node;
  }
  if (node.children) {
    node.children.forEach(function(node, index){
      this.parse(node, path + '.' + (node.key || index));
    }, this);
  }
};

},{}],16:[function(_require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],17:[function(_require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],18:[function(_require,module,exports){

/**
 * Module dependencies.
 */

try {
  var type = _require('type');
} catch (err) {
  var type = _require('component-type');
}

var toFunction = _require('to-function');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`
 * in optional context `ctx`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @param {Object} [ctx]
 * @api public
 */

module.exports = function(obj, fn, ctx){
  fn = toFunction(fn);
  ctx = ctx || this;
  switch (type(obj)) {
    case 'array':
      return array(obj, fn, ctx);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn, ctx);
      return object(obj, fn, ctx);
    case 'string':
      return string(obj, fn, ctx);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function string(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function object(obj, fn, ctx) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn.call(ctx, key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function array(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj[i], i);
  }
}

},{"component-type":19,"to-function":20,"type":19}],19:[function(_require,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],20:[function(_require,module,exports){
var expr;
try {
    expr = void 0;
} catch (e) {
    expr = _require('component-props');
}
module.exports = toFunction;
function toFunction(obj) {
    switch ({}.toString.call(obj)) {
    case '[object Object]':
        return objectToFunction(obj);
    case '[object Function]':
        return obj;
    case '[object String]':
        return stringToFunction(obj);
    case '[object RegExp]':
        return regexpToFunction(obj);
    default:
        return defaultToFunction(obj);
    }
}
function defaultToFunction(val) {
    return function (obj) {
        return val === obj;
    };
}
function regexpToFunction(re) {
    return function (obj) {
        return re.test(obj);
    };
}
function stringToFunction(str) {
    if (/^ *\W+/.test(str))
        return new Function('_', 'return _ ' + str);
    return new Function('_', 'return ' + get(str));
}
function objectToFunction(obj) {
    var match = {};
    for (var key in obj) {
        match[key] = typeof obj[key] === 'string' ? defaultToFunction(obj[key]) : toFunction(obj[key]);
    }
    return function (val) {
        if (typeof val !== 'object')
            return false;
        for (var key in match) {
            if (!(key in val))
                return false;
            if (!match[key](val[key]))
                return false;
        }
        return true;
    };
}
function get(str) {
    var props = expr(str);
    if (!props.length)
        return '_.' + str;
    var val, i, prop;
    for (i = 0; i < props.length; i++) {
        prop = props[i];
        val = '_.' + prop;
        val = '(\'function\' == typeof ' + val + ' ? ' + val + '() : ' + val + ')';
        str = stripNested(prop, str, val);
    }
    return str;
}
function stripNested(prop, str, val) {
    return str.replace(new RegExp('(\\.)?' + prop, 'g'), function ($0, $1) {
        return $1 ? $0 : val;
    });
}
},{"component-props":21}],21:[function(_require,module,exports){
/**
 * Global Names
 */

var globals = /\b(this|Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[$a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

},{}],22:[function(_require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],23:[function(_require,module,exports){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val;
};

},{}],24:[function(_require,module,exports){
var type = _require('type')

// (any, any, [array]) -> boolean
function equal(a, b, memos){
  // All identical values are equivalent
  if (a === b) return true
  var fnA = types[type(a)]
  var fnB = types[type(b)]
  return fnA && fnA === fnB
    ? fnA(a, b, memos)
    : false
}

var types = {}

// (Number) -> boolean
types.number = function(a, b){
  return a !== a && b !== b/*Nan check*/
}

// (function, function, array) -> boolean
types['function'] = function(a, b, memos){
  return a.toString() === b.toString()
    // Functions can act as objects
    && types.object(a, b, memos)
    && equal(a.prototype, b.prototype)
}

// (date, date) -> boolean
types.date = function(a, b){
  return +a === +b
}

// (regexp, regexp) -> boolean
types.regexp = function(a, b){
  return a.toString() === b.toString()
}

// (DOMElement, DOMElement) -> boolean
types.element = function(a, b){
  return a.outerHTML === b.outerHTML
}

// (textnode, textnode) -> boolean
types.textnode = function(a, b){
  return a.textContent === b.textContent
}

// decorate `fn` to prevent it re-checking objects
// (function) -> function
function memoGaurd(fn){
  return function(a, b, memos){
    if (!memos) return fn(a, b, [])
    var i = memos.length, memo
    while (memo = memos[--i]) {
      if (memo[0] === a && memo[1] === b) return true
    }
    return fn(a, b, memos)
  }
}

types['arguments'] =
types.array = memoGaurd(arrayEqual)

// (array, array, array) -> boolean
function arrayEqual(a, b, memos){
  var i = a.length
  if (i !== b.length) return false
  memos.push([a, b])
  while (i--) {
    if (!equal(a[i], b[i], memos)) return false
  }
  return true
}

types.object = memoGaurd(objectEqual)

// (object, object, array) -> boolean
function objectEqual(a, b, memos) {
  if (typeof a.equal == 'function') {
    memos.push([a, b])
    return a.equal(b, memos)
  }
  var ka = getEnumerableProperties(a)
  var kb = getEnumerableProperties(b)
  var i = ka.length

  // same number of properties
  if (i !== kb.length) return false

  // although not necessarily the same order
  ka.sort()
  kb.sort()

  // cheap key test
  while (i--) if (ka[i] !== kb[i]) return false

  // remember
  memos.push([a, b])

  // iterate again this time doing a thorough check
  i = ka.length
  while (i--) {
    var key = ka[i]
    if (!equal(a[key], b[key], memos)) return false
  }

  return true
}

// (object) -> array
function getEnumerableProperties (object) {
  var result = []
  for (var k in object) if (k !== 'constructor') {
    result.push(k)
  }
  return result
}

module.exports = equal

},{"type":25}],25:[function(_require,module,exports){

var toString = {}.toString
var DomNode = typeof window != 'undefined'
  ? window.Node
  : Function

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = exports = function(x){
  var type = typeof x
  if (type != 'object') return type
  type = types[toString.call(x)]
  if (type) return type
  if (x instanceof DomNode) switch (x.nodeType) {
    case 1:  return 'element'
    case 3:  return 'text-node'
    case 9:  return 'document'
    case 11: return 'document-fragment'
    default: return 'dom-node'
  }
}

var types = exports.types = {
  '[object Function]': 'function',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Arguments]': 'arguments',
  '[object Array]': 'array',
  '[object String]': 'string',
  '[object Null]': 'null',
  '[object Undefined]': 'undefined',
  '[object Number]': 'number',
  '[object Boolean]': 'boolean',
  '[object Object]': 'object',
  '[object Text]': 'text-node',
  '[object Uint8Array]': 'bit-array',
  '[object Uint16Array]': 'bit-array',
  '[object Uint32Array]': 'bit-array',
  '[object Uint8ClampedArray]': 'bit-array',
  '[object Error]': 'error',
  '[object FormData]': 'form-data',
  '[object File]': 'file',
  '[object Blob]': 'blob'
}

},{}],26:[function(_require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toString.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],27:[function(_require,module,exports){
/** generate unique id for selector */
var counter = Date.now() % 1e9;

module.exports = function getUid(){
	return (Math.random() * 1e9 >>> 0) + (counter++);
};
},{}],28:[function(_require,module,exports){
(function (root, factory){
  'use strict';

  /*istanbul ignore next:cant test*/
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.objectPath = factory();
  }
})(this, function(){
  'use strict';

  var
    toStr = Object.prototype.toString,
    _hasOwnProperty = Object.prototype.hasOwnProperty;

  function isEmpty(value){
    if (!value) {
      return true;
    }
    if (isArray(value) && value.length === 0) {
      return true;
    } else {
      for (var i in value) {
        if (_hasOwnProperty.call(value, i)) {
          return false;
        }
      }
      return true;
    }
  }

  function toString(type){
    return toStr.call(type);
  }

  function isNumber(value){
    return typeof value === 'number' || toString(value) === "[object Number]";
  }

  function isString(obj){
    return typeof obj === 'string' || toString(obj) === "[object String]";
  }

  function isObject(obj){
    return typeof obj === 'object' && toString(obj) === "[object Object]";
  }

  function isArray(obj){
    return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
  }

  function isBoolean(obj){
    return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
  }

  function getKey(key){
    var intKey = parseInt(key);
    if (intKey.toString() === key) {
      return intKey;
    }
    return key;
  }

  function set(obj, path, value, doNotReplace){
    if (isNumber(path)) {
      path = [path];
    }
    if (isEmpty(path)) {
      return obj;
    }
    if (isString(path)) {
      return set(obj, path.split('.').map(getKey), value, doNotReplace);
    }
    var currentPath = path[0];

    if (path.length === 1) {
      var oldVal = obj[currentPath];
      if (oldVal === void 0 || !doNotReplace) {
        obj[currentPath] = value;
      }
      return oldVal;
    }

    if (obj[currentPath] === void 0) {
      //check if we assume an array
      if(isNumber(path[1])) {
        obj[currentPath] = [];
      } else {
        obj[currentPath] = {};
      }
    }

    return set(obj[currentPath], path.slice(1), value, doNotReplace);
  }

  function del(obj, path) {
    if (isNumber(path)) {
      path = [path];
    }

    if (isEmpty(obj)) {
      return void 0;
    }

    if (isEmpty(path)) {
      return obj;
    }
    if(isString(path)) {
      return del(obj, path.split('.'));
    }

    var currentPath = getKey(path[0]);
    var oldVal = obj[currentPath];

    if(path.length === 1) {
      if (oldVal !== void 0) {
        if (isArray(obj)) {
          obj.splice(currentPath, 1);
        } else {
          delete obj[currentPath];
        }
      }
    } else {
      if (obj[currentPath] !== void 0) {
        return del(obj[currentPath], path.slice(1));
      }
    }

    return obj;
  }

  var objectPath = {};

  objectPath.has = function (obj, path) {
    if (isEmpty(obj)) {
      return false;
    }

    if (isNumber(path)) {
      path = [path];
    } else if (isString(path)) {
      path = path.split('.');
    }

    if (isEmpty(path) || path.length === 0) {
      return false;
    }

    for (var i = 0; i < path.length; i++) {
      var j = path[i];
      if ((isObject(obj) || isArray(obj)) && _hasOwnProperty.call(obj, j)) {
        obj = obj[j];
      } else {
        return false;
      }
    }

    return true;
  };

  objectPath.ensureExists = function (obj, path, value){
    return set(obj, path, value, true);
  };

  objectPath.set = function (obj, path, value, doNotReplace){
    return set(obj, path, value, doNotReplace);
  };

  objectPath.insert = function (obj, path, value, at){
    var arr = objectPath.get(obj, path);
    at = ~~at;
    if (!isArray(arr)) {
      arr = [];
      objectPath.set(obj, path, arr);
    }
    arr.splice(at, 0, value);
  };

  objectPath.empty = function(obj, path) {
    if (isEmpty(path)) {
      return obj;
    }
    if (isEmpty(obj)) {
      return void 0;
    }

    var value, i;
    if (!(value = objectPath.get(obj, path))) {
      return obj;
    }

    if (isString(value)) {
      return objectPath.set(obj, path, '');
    } else if (isBoolean(value)) {
      return objectPath.set(obj, path, false);
    } else if (isNumber(value)) {
      return objectPath.set(obj, path, 0);
    } else if (isArray(value)) {
      value.length = 0;
    } else if (isObject(value)) {
      for (i in value) {
        if (_hasOwnProperty.call(value, i)) {
          delete value[i];
        }
      }
    } else {
      return objectPath.set(obj, path, null);
    }
  };

  objectPath.push = function (obj, path /*, values */){
    var arr = objectPath.get(obj, path);
    if (!isArray(arr)) {
      arr = [];
      objectPath.set(obj, path, arr);
    }

    arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
  };

  objectPath.coalesce = function (obj, paths, defaultValue) {
    var value;

    for (var i = 0, len = paths.length; i < len; i++) {
      if ((value = objectPath.get(obj, paths[i])) !== void 0) {
        return value;
      }
    }

    return defaultValue;
  };

  objectPath.get = function (obj, path, defaultValue){
    if (isNumber(path)) {
      path = [path];
    }
    if (isEmpty(path)) {
      return obj;
    }
    if (isEmpty(obj)) {
      return defaultValue;
    }
    if (isString(path)) {
      return objectPath.get(obj, path.split('.'), defaultValue);
    }

    var currentPath = getKey(path[0]);

    if (path.length === 1) {
      if (obj[currentPath] === void 0) {
        return defaultValue;
      }
      return obj[currentPath];
    }

    return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
  };

  objectPath.del = function(obj, path) {
    return del(obj, path);
  };

  return objectPath;
});

},{}],29:[function(_require,module,exports){
/**
 * Module Dependencies.
 */

var raf = _require('raf');

/**
 * Export `throttle`.
 */

module.exports = throttle;

/**
 * Executes a function at most once per animation frame. Kind of like
 * throttle, but it throttles at ~60Hz.
 *
 * @param {Function} fn - the Function to throttle once per animation frame
 * @return {Function}
 * @public
 */

function throttle(fn) {
  var rtn;
  var ignoring = false;

  return function queue() {
    if (ignoring) return rtn;
    ignoring = true;

    raf(function() {
      ignoring = false;
    });

    rtn = fn.apply(this, arguments);
    return rtn;
  };
}

},{"raf":30}],30:[function(_require,module,exports){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

},{}],31:[function(_require,module,exports){
var inherits = _require('inherits')
var EventEmitter = _require('events').EventEmitter
var raf = _require('raf')
var now = _require('right-now')

module.exports = Engine
function Engine(fn) {
    if (!(this instanceof Engine)) 
        return new Engine(fn)
    this.running = false
    this.last = now()
    this._frame = 0
    this._tick = this.tick.bind(this)

    if (fn)
        this.on('tick', fn)
}

inherits(Engine, EventEmitter)

Engine.prototype.start = function() {
    if (this.running) 
        return
    this.running = true
    this.last = now()
    this._frame = raf(this._tick)
    return this
}

Engine.prototype.stop = function() {
    this.running = false
    if (this._frame !== 0)
        raf.cancel(this._frame)
    this._frame = 0
    return this
}

Engine.prototype.tick = function() {
    this._frame = raf(this._tick)
    var time = now()
    var dt = time - this.last
    this.emit('tick', dt)
    this.last = time
}
},{"events":16,"inherits":32,"raf":33,"right-now":35}],32:[function(_require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],33:[function(_require,module,exports){
var now = _require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":34}],34:[function(_require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}).call(this,_require('_process'))
},{"_process":17}],35:[function(_require,module,exports){
(function (global){
module.exports =
  global.performance &&
  global.performance.now ? function now() {
    return performance.now()
  } : Date.now || function now() {
    return +new Date
  }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],36:[function(_require,module,exports){

var toSpace = _require('to-space-case');


/**
 * Expose `toCamelCase`.
 */

module.exports = toCamelCase;


/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */


function toCamelCase (string) {
  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase();
  });
}
},{"to-space-case":37}],37:[function(_require,module,exports){

var clean = _require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
},{"to-no-case":38}],38:[function(_require,module,exports){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
},{}],39:[function(_require,module,exports){
var Emitter = _require('component-emitter');

module.exports = Tower;

/**
 * Create a new set of channels
 *
 * @return {Function}
 */

function Tower() {
  this.channels = {};
}

/**
 * Close all channels
 */

Tower.prototype.closeAll = function(){
  for (var key in this.channels) {
    var channel = this.channels[key];
    channel.close();
  }
};

/**
 * Get a channel
 *
 * @param {String} name
 *
 * @return {Channel}
 */

Tower.prototype.channel = function(name) {
  var channels = this.channels;
  if (channels[name]) return channels[name];
  var channel = new Channel();
  channel.on('close', function(){
    delete channels[name];
  });
  channels[name] = channel;
  return channel;
};

/**
 * A channel is a group of sockets using a name. We can create
 * new connections to the channel and disconnect them.
 *
 *   new Channel()
 *     .connect([options]) => Socket
 *     .broadcast(name, data)
 *     .close()
 */

function Channel() {
  this.sockets = [];
}

/**
 * Mixin
 */

Emitter(Channel.prototype);

/**
 * Connect to this channel by creating a new socket
 *
 * @param {Object} options
 *
 * @return {Emitter}
 */

Channel.prototype.connect = function(options){
  var self = this;
  var socket = new Emitter();
  socket.disconnect = function(){
    removeFromArray(socket, self.sockets);
    self.emit('disconnect', socket, options);
    socket.emit('disconnect', options);
    socket.off();
  };
  this.sockets.push(socket);
  this.emit('connection', socket, options);
  return socket;
};

/**
 * Broadcast an event to all connected sockets
 *
 * @param {String} name
 * @param {*} data
 *
 * @return {void}
 */

Channel.prototype.broadcast = function(name, data){
  this.sockets.forEach(function(socket){
    socket.emit(name, data);
  });
};

/**
 * Close this channel and close all connections
 *
 * @return {void}
 */

Channel.prototype.close = function(){
  while(this.sockets.length) {
    var socket = this.sockets.pop();
    socket.disconnect();
  }
  this.emit('close');
  this.off();
};

/**
 * Remove an item from an array
 *
 * @param {[type]} item
 * @param {[type]} array
 *
 * @return {[type]}
 */
function removeFromArray(item, array) {
  var index = array.indexOf(item);
  if (index === -1) return;
  array.splice(index, 1);
}
},{"component-emitter":22}]},{},[1])(1)
});