
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');
var bindAll = require('segmentio/bind-all');
var Emitter = require('component/emitter');
var statics = require('./statics');
var protos = require('./protos');
var dom = require('../node');

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
  spec = spec || {};

  /**
   * A component is a stateful virtual dom element.
   *
   * @api public
   */

  function Component() {
    if (!(this instanceof Component)) {
      return dom(Component, arguments[0], arguments[1]);
    }
    this._pendingState = {};
    bindAll(this);
  }

  // for debugging.

  if (spec.displayName) {
    Component.displayName = spec.displayName;
    delete spec.displayName;
  }

  // statics.

  assign(Component, statics, Emitter.prototype);

  // protos.

  assign(Component.prototype, protos, spec, Emitter.prototype);

  return Component;
}
