
/**
 * Module dependencies.
 */

var assign = require('extend');
var Emitter = require('component-emitter');
var statics = require('./statics');
var protos = require('./protos');
var dom = require('virtualize').node;

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

  // Alow just a render function.

  if (typeof spec === 'function') {
    spec = { render: spec };
  }

  /**
   * A component is a stateful virtual dom element.
   *
   * @api public
   */

  function Component() {
    if (!(this instanceof Component)) {
      return dom(Component, arguments[0], arguments[1]);
    }
  }

  // statics.

  Component.props = {};
  Component.options = {};
  assign(Component, statics, Emitter.prototype);

  // protos.

  assign(Component.prototype, protos, spec, Emitter.prototype);

  // for debugging.

  if (spec.displayName) {
    Component.displayName = spec.displayName;
    delete spec.displayName;
  }

  // extract props

  if (spec.props) {
    for (var key in spec.props) {
      Component.prop(key, spec.props[key]);
    }
    delete spec.props;
  }

  return Component;
}
