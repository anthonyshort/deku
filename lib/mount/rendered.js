
/**
 * Dependencies
 */

var node = require('../node');
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
  this.props = props;
  this.state = {};
  this.instance = new Component();
  this.current = this.render();
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

  // merge in the changes
  this.state = merge(this.state, this.instance._pendingState);
  this.props = merge(this.props, this._pendingProps);

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
