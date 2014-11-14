
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
 * @param {Object} spec
 * @return {Function} Component
 * @api public
 */

function component(spec) {

  /**
   * A component is a stateful virtual dom element.
   *
   * @api public
   */

  function Component() {
    this._pendingState = {};
  }

  // statics.

  for (var key in statics) Component[key] = statics[key];

  // protos.

  for (var key in protos) Component.prototype[key] = protos[key];

  // spec.

  for (var key in spec) Component.prototype[key] = spec[key];

  // emitter.

  Emitter(Component);
  Emitter(Component.prototype);

  return Component;
}