
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');
var Interactions = require('./interactions');
var Emitter = require('component/emitter');
var events = require('component/event');
var equal = require('jkroso/equals');
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
 */

function ComponentRenderer(Component, props) {
  this.instance = new Component();
  this.props = props || {};
  this.state = this.instance.initialState();
  this.children = {};
  this.interactions = new Interactions(this);
  this.previous = null;
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
 * Mixin event emitter
 */

Emitter(ComponentRenderer.prototype);

/**
 * Add this mount to the DOM.
 *
 * @param {Element} container
 */

ComponentRenderer.prototype.appendTo = function(container){
  this._beforeMount();
  container.appendChild(this.el);
  this._mount();
};

/**
 * Get an updated version of the virtual tree.
 *
 * TODO: Throw an error if the render method doesn't
 * return a node
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
 * Schedule this component to be updated on the next frame
 *
 * @param {Function} done
 * @return {void}
 */

ComponentRenderer.prototype.queue = function(done) {
  var self = this;
  if (this.dirty) raf.cancel(this.dirty);
  if (typeof done === 'function') self.once('flush', done);
  this.dirty = raf(function(){
    self.update();
    self.emit('flush');
  });
};

/**
 * Update the props on the component.
 *
 * @return {Node}
 */

ComponentRenderer.prototype.update = function(){
  // Changes have already been rendered. If they haven't
  // we'll make sure we cancel any frames currently queue
  // to prevent multiple renders
  if (!this.dirty) return;
  raf.cancel(this.dirty);
  this.dirty = false;

  var nextProps = this._pendingProps;
  var nextState = this.instance._pendingState;

  // the props and state haven't changed.
  if (!nextProps && !nextState) return;

  // props and state are the same.
  if (equal(nextProps, this.props) && equal(nextState, this.state)) return;

  // pre-update.
  this.lifecycle('beforeUpdate', [ this.state, this.props, nextState, nextProps ]);

  // merge in the changes.
  var previousState = this.state;
  var previousProps = this.props;
  this.state = assign(this.state, this.instance._pendingState);
  this.props = this._pendingProps;

  // reset.
  this.instance._pendingState = false;
  this._pendingProps = false;

  // render the current state.
  this.previous = this.current;
  this.current = this.render();

  // update the element to match.
  diff(this);

  // unset previous so we don't keep it in memory
  this.previous = null;

  // post-update.
  this.lifecycle('afterUpdate', [ this.state, this.props, previousState, previousProps ]);
};

/**
 * Remove the component from the DOM.
 */

ComponentRenderer.prototype.remove = function(){
  var el = this.el;
  if (!el) return;
  // TODO: add support for animation transitions (async behavior).
  this.lifecycle('beforeUnmount', [ el ]);
  if (el.parentNode) el.parentNode.removeChild(el);
  this.each(function(child){
    child.remove();
  });
  this.lifecycle('unmount');
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

ComponentRenderer.prototype.lifecycle = function(name, args){
  if (typeof this.instance[name] === 'function') {
    this.instance[name].apply(this.instance, args);
  }
};

/**
 * Remove all components within a node.
 *
 * @param {Node} node
 */

ComponentRenderer.prototype.removeComponents = function(node){
  var self = this;

  // text nodes can't have children
  if (node.type === 'text') return;

  // remove a child component
  if (node.type === 'component') {
    var path = this.previous.getPath(node);
    this.children[path].remove();
    delete this.children[path];
  }

  // recursively remove components
  if (node.children) {
    node.children.forEach(function(child){
      self.removeComponents(child);
    });
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

  // We can only render nodes that exist within the tree
  if (!path) {
    throw new Error('Node does not exist in the current tree');
  }

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

  // otherwise, it's a component node
  var child = this.children[path] = new ComponentRenderer(node.component, node.props);

  // return el for components that have a root node that's another component.
  return child.el;
};

/**
 * Trigger `mount` event on this component and all sub-components.
 */

ComponentRenderer.prototype._mount = function(){
  this.lifecycle('mount', [this.el]);
  this.each(function(mount){
    mount._mount();
  });
};

/**
 * Trigger `beforeMount` event on this component and all sub-components.
 */

ComponentRenderer.prototype._beforeMount = function(){
  this.lifecycle('beforeMount');
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
  switch (key) {
    case 'class':
    case 'className':
      el.setAttribute('className', val); // IE
      el.setAttribute('class', val); // rest of browsers
      break;
    case 'style':
      for (var style in val) el.style[style] = val[style];
      break;
    case 'onclick':
    case 'onfocus':
    case 'onblur':
    case 'onmouseover':
    case 'onmouseout':
    case 'onkeypress':
    case 'onkeyup':
    case 'onkeydown':
    case 'onchange':
      this.interactions.bind(el, key, val);
      break;
    default:
      el.setAttribute(key, val);
      break;
  }
}

/**
 * Remove attributes in a generic way.
 *
 * TODO: more generic.
 *
 * @param {HTMLElement} el
 * @param {String} key
 * @param {Mixed} val
 */

ComponentRenderer.prototype.removeAttribute = function(el, key){
  switch (key) {
    case 'class':
    case 'className':
      el.removeAttribute('className'); // IE
      el.removeAttribute('class'); // rest of browsers
      break;
    case 'onclick':
    case 'onfocus':
    case 'onblur':
    case 'onmouseover':
    case 'onmouseout':
    case 'onkeypress':
    case 'onkeyup':
    case 'onkeydown':
    case 'onchange':
      this.interactions.unbind(el, key);
      break;
    default:
      el.removeAttribute(key);
      break;
  }
}