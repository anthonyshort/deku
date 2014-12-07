
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');
var toString = require('../renderer/string');
var ComponentRenderer = require('../renderer/component');

/**
 * Use plugin.
 *
 * @param {Function|Object} plugin Passing an object will extend the prototype.
 * @return {Component}
 * @api public
 */

exports.use = function(plugin){
  if ('function' === typeof plugin) {
    plugin(this);
  } else {
    assign(this.prototype, plugin);
  }
  return this;
};

/**
 * Mount this component to a node. Only available
 * in the browser as it requires the DOM.
 *
 * @param {HTMLElement} container
 * @param {Object} props
 */

if (typeof window !== 'undefined') {
  var Scene = require('../scene');
  exports.render =
  exports.mount = function(container, props){
    var renderer = new ComponentRenderer(this, props);
    var scene = new Scene(container, renderer);
    return scene;
  };
}

/**
 * Render this component to a string.
 *
 * @param {Object} props
 */

exports.renderString = function(props){
  return toString(this, props);
};
