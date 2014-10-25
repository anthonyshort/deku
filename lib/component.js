
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

  /**
   * A component is a stateful virtual dom element.
   *
   * @param {VirtualNode} node
   * @api public
   */

  function Component(node) {
    if (!(this instanceof Component)) return new Component(node);
    bindAll(this);
    this.props = merge(merge({}, this.constructor.props), node.attributes);
    this.state = merge({}, this.constructor.states);
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
  Component.nodeType = 'component';

  // protos.

  Component.prototype = {};
  for (var key in protos) Component.prototype[key] = protos[key];
  if (render) Component.prototype.render = render;
  Component.prototype.constructor = Component;

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
