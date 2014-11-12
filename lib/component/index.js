
/**
 * Module dependencies.
 */

var statics = require('./statics');
var protos = require('./protos');
var node = require('../node');
var Emitter = require('component/emitter');

/**
 * Expose `component`.
 */

module.exports = component;

/**
 * Generate a new `Component` constructor.
 *
 * @param {Function} render
 * @return {Function} Component
 * @api public
 */

function component(render) {

  if (!render) {
    throw new Error('You gotta implement render, should be quick.');
  }

  /**
   * A component is a stateful virtual dom element.
   *
   * @param {Object} props Immutable properties
   * @param {Object} state Internal state
   * @api public
   */

  function Component(props, state) {
    this.props = props;
    this.state = state;
    this.emit('created');
    this.update();
  }

  // statics.

  for (var key in statics) Component[key] = statics[key];

  // protos.

  for (var key in protos) Component.prototype[key] = protos[key];

  Component.prototype.render = function(){
    return render(this.state, this.props, node);
  };

  // emitter.

  Emitter(Component);
  Emitter(Component.prototype);

  return Component;
}