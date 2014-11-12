
/**
 * Dependencies
 */

var diff = require('../diff');
var node = require('../node');
var equal = require('jkroso/equals');

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
  this.props = props;
  this.state = {};
  this.instance = new Component();
  this.current = this.render();
}

/**
 * Update the props on the component
 *
 * @param {Object} newProps
 * @param {Element} el
 *
 * @return {void}
 */

Rendered.prototype.update = function(newProps) {
  // if (equal(newProps, props) && !this.instance.hasPendingState()) return;
  this.state = merge(this.state, this.instance._pendingState);
  this.props = newProps;
  this.instance._pendingState = {};
  var next = this.render();
  return diff(this, next);
}

/**
 * Get an updated version of the virtual tree
 *
 * @return {Node}
 */

Rendered.prototype.render = function(props) {
  return this.instance.render(this.state, this.props, node);
}

/**
 * Render the component to a real DOM element
 *
 * @return {Element}
 */

Rendered.prototype.toElement = function() {
  return this.current.toElement();
}

/**
 * Call the lifecycle callbacks
 */

Rendered.prototype.lifecycle = function(name, args) {
  if (typeof this.instance[name] === 'function') {
    this.instance[name].apply(this.instance, args);
  }
}

/**
 * Destroy this component
 */

Rendered.prototype.remove = function() {
  // TODO
}
