
/**
 * Module dependencies.
 */

var statics = require('./statics');
var protos = require('./protos');
var node = require('../node');
var Emitter = require('component/emitter');
var assign = require('sindresorhus/object-assign:index.js');

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

  // for debugging.

  if (spec && spec.displayName) {
    Component.displayName = spec.displayName;
    delete spec.displayName;
  }

  // statics.

  assign(Component, statics, Emitter.prototype);

  // protos.

  assign(Component.prototype, protos, spec, Emitter.prototype);

  return Component;
}