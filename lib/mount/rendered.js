
/**
 * Dependencies
 */

var node = require('../node');
var Tree = require('./tree');
var equal = require('jkroso/equals');
var merge = require('yields/merge');

/**
 * Exports
 */

module.exports = Rendered;

/**
 * A rendered component instance. This manages the lifecycle,
 * props and state of the component.
 *
 * @param {Function} Component
 * @param {Object} props
 */

function Rendered(Component, props) {
  this.props = props || {};
  this.state = {};
  this.instance = new Component();
  this.setCurrent(this.render());
}

/**
 * Set the next props. These will get merged in on the next render
 *
 * @param {Object} nextProps
 */

Rendered.prototype.setProps = function(nextProps) {
  this._pendingProps = merge(this._pendingProps || {}, nextProps);
}

/**
 * Set the current state of the tree
 *
 * @param {Node} node
 */

Rendered.prototype.setCurrent = function(node) {
  this.current = node;
  this.tree = new Tree(node);
}

/**
 * Update the props on the component
 *
 * @return {Node}
 */

Rendered.prototype.update = function() {
  var nextProps = this._pendingProps;
  var nextState = this.instance._pendingState;

  // the props and state haven't changed
  if (!nextProps && !nextState) return;

  // props and state are the same
  if (equal(nextProps, this.props) && equal(nextState, this.state)) return;

  // pre-update
  this.lifecycle('beforeUpdate', [nextProps, nextState]);

  // merge in the changes
  this.state = merge(merge({}, this.state), this.instance._pendingState);
  this.props = merge(merge({}, this.props), this._pendingProps);

  // reset
  this.instance._pendingState = false;
  this._pendingProps = false;

  // render the current state
  return this.render();
}

/**
 * Get an updated version of the virtual tree
 *
 * @return {Node}
 */

Rendered.prototype.render = function(props) {
  return this.instance.render(node, this.state, this.props);
}

/**
 * Call the lifecycle callbacks
 */

Rendered.prototype.lifecycle = function(name, args) {
  if (typeof this.instance[name] === 'function') {
    this.instance[name].apply(this.instance, args);
  }
  // allows ComponentA.on('mount', function(instance, arg, arg){})
  // this.instance.constructor.emit.call(this.instance.constructor, [name, this.instance].concat(args));
}

/**
 * Walk the nodes in this component
 */

Rendered.prototype.walk = function(fn) {
  this.tree.walk(fn);
}

/**
 * Get the path (eg. 0.1.3) of a node in the tree
 *
 * @param {Node} node
 *
 * @return {String}
 */

Rendered.prototype.path = function(node) {
  return this.tree.path(node);
}