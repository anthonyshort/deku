
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
   * The component controls the lifecycle of the
   * element that it creates from a template.
   * Each element can only have one component and
   * each component can only have one element.
   *
   * @param {Node} node
   * @param {Object} options
   * @api public
   */

  function Component(node) {
    if (!(this instanceof Component)) return new Component(node);
    // bind all functions to `this`.
    for (var name in this) {
      if ('function' == typeof this[name] && 'constructor' != name) {
        this[name] = bind(this, name);
        // add event handlers!
        if (name.match(/^on(\w+)$/)) this.on(RegExp.$1, this[name]);
      }
    };

    this.props = merge(merge({}, this.constructor.props), node.attributes);
    this.state = merge({}, this.constructor.states);
    this.type = 'component';
    this.lifecycle = null;
    this.owner = node;
    this.id = null;
  }

  // statics.

  for (var key in statics) Component[key] = statics[key];
  Component.states = {};
  Component.props = {};

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
