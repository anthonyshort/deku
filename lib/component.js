
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
      if ('function' == typeof this[name]) {
        this[name] = bind(this, name);
      }
    };

    this.type = 'component';
    this.lifecycle = null;
    this.owner = node;
    this.dom = node.dom;
    this.props = merge({}, this.constructor.props, node.attrs);
    this.state = merge({}, this.constructor.states);
    this.currentComponent = null;
    this.previousNode = null;
    this.currentNode = null;
    this.id = null;
  }

  // emitter.

  Emitter(Component);
  Emitter(Component.prototype);

  // statics.

  if (name) Component.__name__ = name;
  Component.states = {};
  Component.props = {};
  Component.tags = {};
  for (var key in statics) Component[key] = statics[key];

  // protos.

  Component.prototype = {};
  Component.prototype.constructor = Component;
  for (var key in protos) Component.prototype[key] = protos[key];
  if (render) Component.prototype.render = render;

  return Component;
}
