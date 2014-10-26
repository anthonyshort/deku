
/**
 * Module dependencies.
 */

var statics = require('./component/statics');
var protos = require('./component/protos');
var Emitter = require('component/emitter');
var bind = require('component/bind');
var merge = require('yields/merge');

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
   * @param {Node} node
   * @api public
   */

  function Component(node) {
    if (!(this instanceof Component)) return new Component(node);
    bindAll(this);
    this.props = node.data.props;
    this.state = this.getInitialState();
    this.lifecycle = null;
    this.owner = node;
    this.node = null;
    this.path = null;
    this.root = null;
  }

  // statics.

  for (var key in statics) Component[key] = statics[key];
  Component.states = {};
  Component.props = {};

  // protos.

  for (var key in protos) Component.prototype[key] = protos[key];
  Component.prototype.render = render;

  // emitter.

  Emitter(Component);
  Emitter(Component.prototype);

  return Component;
}

/**
 * Bind all methods to `emitter`.
 *
 * @param {Object} emitter
 * @api private
 */

function bindAll(emitter) {
  for (var name in emitter) {
    if ('function' == typeof emitter[name] && 'constructor' != name) {
      emitter[name] = bind(emitter, name);
      // add event handlers!
      if (name.match(/^on(\w+)$/)) emitter.on(RegExp.$1, emitter[name]);
    }
  };
}
