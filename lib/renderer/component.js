
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');
var Interactions = require('./interactions');
var events = require('component/event');
var equal = require('jkroso/equals');
var bind = require('component/bind');
var node = require('../node');
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
  this.setCurrent(this.render());

  // when component state changes.
  this.instance.on('change', bind(this, this.update));

  // Create the element
  // TODO we could potentially pass in a pre-rendered element and
  // use that instead of creating a new one.
  this.el = this.toElement(this.current, this.tree);

  // TODO: This should know the current lifecycle state of the c
  // component so that we can do things like preventing updates
  // while unmounting
}

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
  return this.instance.render(node, this.state, this.props);
};

/**
 * Update the props on the component.
 *
 * @return {Node}
 */

ComponentRenderer.prototype.update = function(){
  var nextProps = this._pendingProps;
  var nextState = this.instance._pendingState;

  // the props and state haven't changed.
  if (!nextProps && !nextState) return;

  // props and state are the same.
  if (equal(nextProps, this.props) && equal(nextState, this.state)) return;

  // pre-update.
  this.lifecycle('beforeUpdate', [ nextProps, nextState ]);

  // merge in the changes.
  this.state = assign({}, this.state, this.instance._pendingState);
  this.props = assign({}, this.props, this._pendingProps);

  // reset.
  this.instance._pendingState = false;
  this._pendingProps = false;

  // render the current state.
  var next = this.render();

  // nothing to render.
  if (!next) return;

  // transform the tree into paths.
  var nextTree = new Tree(next);

  // update the element to match.
  diff(this, nextTree);

  // set the new current tree.
  // TODO do we need to rebuild the tree every time?
  this.setCurrent(next, nextTree);

  // post-update.
  this.lifecycle('update', [ this.props, this.state ]);
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
 */

ComponentRenderer.prototype.setProps = function(nextProps){
  // TODO possibly don't merge props, just replace them so we could
  // potentially send through an immutable object
  this._pendingProps = assign(this._pendingProps || {}, nextProps);
};

/**
 * Set the current state of the tree.
 *
 * @param {Node} node
 * @param {Tree} tree
 */

ComponentRenderer.prototype.setCurrent = function(node, tree){
  if (!node) {
    this.current = null;
    this.tree = null;
    return;
  }
  this.current = node;
  this.tree = tree || new Tree(node);
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
 * Walk the nodes in this component.
 *
 * @param {Function} fn
 */

ComponentRenderer.prototype.walk = function(fn){
  if (!this.tree) return; // This node renders nothing
  this.tree.walk(fn);
};

/**
 * Get the path (eg. 0.1.3) of a node in the tree.
 *
 * @param {Node} node
 *
 * @return {String}
 */

ComponentRenderer.prototype.path = function(node){
  return this.tree.path(node);
};

/**
 * Get a child component using the `ComponentNode`.
 *
 * @param {ComponentNode} node
 * @return {Mount}
 */

ComponentRenderer.prototype.getChildByNode = function(node){
  var path = this.path(node);
  var child = this.children[path];
  return child;
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
    var path = this.path(node);
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

ComponentRenderer.prototype.toElement = function(node, tree){
  // TODO: When creating elements from the next version of the
  // tree we need to use that tree to get the paths, not the current
  // tree, but we need to use the current mount to store the components
  // on. Could we just set the next tree to be the current tree before doing the
  // diff?

  // this component renders nothing.
  // TODO: probably don't allow this to happen
  if (!node) {
    return document.createElement('noscript');
  }

  if (node.type === 'text') {
    return document.createTextNode(node.data);
  }

  if (node.type === 'element') {
    var el = document.createElement(node.tagName);
    // precompute path.
    el.__path__ = tree.path(node);
    var children = node.children;
    // add attributes.
    this.applyAttributes(el, node.attributes);

    // add children.
    for (var i = 0, n = children.length; i < n; i++) {
      el.appendChild(this.toElement(children[i], tree));
    }
    return el;
  }

  // otherwise, it's a component node
  var path = tree.path(node);
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
    case 'style':
      // TODO
      // for (var style in val) el.style[style] = val[style];
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
