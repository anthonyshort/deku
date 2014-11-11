
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
 * @param {Object} methods
 * @return {Function} Component
 * @api public
 */

function component(methods) {

  /**
   * A component is a stateful virtual dom element.
   *
   * @param {Object} props Immutable properties
   * @api public
   */

  function Component(props) {
    this.methods = methods;
    this.props = props;
    this.state = {};
  }

  // statics.

  for (var key in statics) Component[key] = statics[key];

  // protos.

  for (var key in protos) Component.prototype[key] = protos[key];

  // render

  Component.prototype.render = function(){
    return this.methods.render(this.state, this.props, node);
  };

  // emitter.

  Emitter(Component);
  Emitter(Component.prototype);

  return Component;
}