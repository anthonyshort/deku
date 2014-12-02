
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');
var Interactions = require('./interactions');
var Emitter = require('component/emitter');
var events = require('component/event');
var bind = require('component/bind');
var raf = require('component/raf');
var dom = require('../node');
var diff = require('./diff');
var Tree = require('./tree');

/**
 * Expose `ComponentRenderer`.
 */

module.exports = ComponentRenderer;

/**
 * A rendered component instance.
 *
 * This manages the lifecycle, props and state of the component.
 *
 * @param {Function} Component
 * @param {Object} props
 * @param {String} path The path to this component from the root
 */

function ComponentRenderer(Component, props, path, parentState) {
  this.path = path;
  this.parentState = parentState;
  this.instance = new Component();
  this.props = props || {};
  this.state = parentState[this.path] = parentState[this.path] || this.instance.initialState();
  this.children = {};
  this.interactions = new Interactions(this);
  this.previous = null;
  this.lifecycleState = null;
  this.current = this.render();
  this.dirty = false;

  // when component state changes.
  this.instance.on('change', bind(this, this.queue));

  // Create the element
  this.el = this.toElement(this.current.root);
  this.interactions.init();

  // TODO we could potentially pass in a pre-rendered element and
  // use that instead of creating a new one.

  // TODO: This should know the current lifecycle state of the c
  // component so that we can do things like preventing updates
  // while unmounting
}

/**
 * Mixin event emitter.
 */

Emitter(ComponentRenderer.prototype);

/**
 * Mixin diff.
 */

assign(ComponentRenderer.prototype, diff);

/**
 * Add this mount to the DOM.
 *
 * @param {Element} container
 */

ComponentRenderer.prototype.appendTo = function(container){
  this._beforeMount();
  container.appendChild(this.el);
  this._afterMount();
};

/**
 * Get an updated version of the virtual tree.
 *
 * TODO: Throw an error if the render method doesn't return a node.
 *
 * @return {Node}
 */

ComponentRenderer.prototype.render = function(){
  var node = this.instance.render(dom, this.state, this.props);
  if (!node) {
    throw new Error('Component#render must return a Node using the dom object');
  }
  return new Tree(node);
};

/**
 * Schedule this component to be updated on the next frame.
 *
 * @param {Function} done
 * @return {void}
 */

ComponentRenderer.prototype.queue = function(done){
  var self = this;
  if (typeof done === 'function') self.once('flush', done);
  if (this.lifecycleState === 'updating') return;
  if (this.dirty) raf.cancel(this.dirty);
  this.dirty = raf(function(){
    self.update();
  });
};

/**
 * Force update the component.
 *
 * This invalidates the component and renders it immediately.
 */

ComponentRenderer.prototype.forceUpdate = function(){
  this.queue();
  this.update(true);
};

/**
 * Update the props on the component. Optionally force
 * the update regardless of whether or not the shouldUpdate
 * test passes in the component.
 *
 * @param {Boolean} force
 * @return {Node}
 */

ComponentRenderer.prototype.update = function(force){
  var self = this;

  // changes have already been rendered. if they haven't
  // we'll make sure we cancel any frames currently queue
  // to prevent multiple renders.
  if (!this.dirty) return;
  raf.cancel(this.dirty);
  this.dirty = false;

  // Set the lifecycle state to prevent re-rendering.
  if (this.lifecycleState === 'updating') return;
  this.lifecycleState = 'updating';

  // when we're done updating.
  function done() {
    // reset the lifecycle state.
    self.lifecycleState = null;
    self.emit('flush');
  }

  var nextProps = this._pendingProps;
  var nextState = this.instance._pendingState;
  var shouldUpdate = this.instance.shouldUpdate(this.state, this.props, nextState, nextProps);

  // check the component.
  if (!force && !shouldUpdate) return done();

  // pre-update.
  this.trigger('beforeUpdate', [
    this.state,
    this.props,
    nextState,
    nextProps
  ]);

  // merge in the changes.
  var previousState = this.state;
  var previousProps = this.props;
  this.state = assign({}, this.state, this.instance._pendingState);
  this.props = this._pendingProps || this.props;

  // update the root
  this.parentState[this.path] = this.state;

  // reset.
  this.instance._pendingState = false;
  this._pendingProps = false;

  // render the current state.
  this.previous = this.current;
  this.current = this.render();

  // update the element to match.
  this.diff();

  // unset previous so we don't keep it in memory.
  this.previous = null;

  // post-update.
  this.trigger('afterUpdate', [
    this.state,
    this.props,
    previousState,
    previousProps
  ]);

  // trigger all callbacks
  done();
};

/**
 * Remove the component from the DOM.
 */

ComponentRenderer.prototype.remove = function(){
  var el = this.el;
  if (!el) return;
  // TODO: add support for animation transitions (async behavior).
  this.trigger('beforeUnmount', [
    this.el,
    this.state,
    this.props,
  ]);
  if (el.parentNode) el.parentNode.removeChild(el);
  this.each(function(child){
    child.remove();
  });
  this.trigger('afterUnmount', [
    this.el,
    this.state,
    this.props,
  ]);
  delete this.parentState[this.path];
  this.children = {};
  this.el = null;
};

/**
 * Set the next props.
 *
 * These will get merged in on the next render.
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

ComponentRenderer.prototype.setProps = function(nextProps, done){
  this._pendingProps = nextProps;
  this.queue(done);
};

/**
 * Call the lifecycle callbacks.
 *
 * @param {String} name
 * @param {Arguments} args
 */

ComponentRenderer.prototype.trigger = function(name, args){
  if (typeof this.instance[name] === 'function') {
    this.instance[name].apply(this.instance, args);
  }
};

/**
 * Call a method on each sub-component
 *
 * @param {Function} fn
 */

ComponentRenderer.prototype.each = function(fn){
  for (var path in this.children) {
    fn(this.children[path]);
  }
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
 * @return {Element}
 */

ComponentRenderer.prototype.toElement = function(node){
  var path = this.current.getPath(node);

  // we can only render nodes that exist within the tree.
  if (!path) throw new Error('Node does not exist in the current tree');

  if (node.type === 'text') {
    return document.createTextNode(node.data);
  }

  if (node.type === 'element') {
    var el = document.createElement(node.tagName);
    // precompute path.
    el.__path__ = path
    var children = node.children;
    // add attributes.
    this.applyAttributes(el, node.attributes);

    // add children.
    for (var i = 0, n = children.length; i < n; i++) {
      el.appendChild(this.toElement(children[i]));
    }
    return el;
  }

  // otherwise, it's a component node.
  var child = new ComponentRenderer(node.component, node.props, this.path + '.' + path, this.parentState);
  this.children[path] = child;

  // return el for components that have a root node that's another component.
  return child.el;
};

/**
 * Trigger `afterMount` event on this component and all sub-components.
 */

ComponentRenderer.prototype._afterMount = function(){
  this.trigger('afterMount', [
    this.el,
    this.state,
    this.props,
  ]);
  this.each(function(mount){
    mount._afterMount();
  });
};

/**
 * Trigger `beforeMount` event on this component and all sub-components.
 */

ComponentRenderer.prototype._beforeMount = function(){
  this.trigger('beforeMount', [
    this.el,
    this.state,
    this.props,
  ]);
  this.each(function(mount){
    mount._beforeMount();
  });
};

/**
 * Apply dom attributes, styles, and event listeners to an element.
 *
 * TODO: Abstract away into it's own module, and perhaps simplify.
 *
 * @param {HTMLElement} el
 * @param {Object} attributes
 */

ComponentRenderer.prototype.applyAttributes = function(el, attributes){
  for (var key in attributes) {
    this.setAttribute(el, key, attributes[key]);
  }
};

/**
 * Set attributes in a generic way.
 *
 * TODO: more generic.
 *
 * @param {HTMLElement} el
 * @param {String} key
 * @param {Mixed} val
 */

ComponentRenderer.prototype.setAttribute = function(el, key, val){
  if (Interactions.isEvent(key)) {
    return this.interactions.bind(el, key, val);
  }
  el.setAttribute(key, val);
}

/**
 * Remove attributes in a generic way.
 *
 * TODO: more generic.
 *
 * @param {HTMLElement} el
 * @param {String} key
 */

ComponentRenderer.prototype.removeAttribute = function(el, key){
  if (Interactions.isEvent(key)) {
    return this.interactions.unbind(el, key);
  }
  el.removeAttribute(key);
}
