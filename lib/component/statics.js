
/**
 * Module dependencies.
 */

var assign = require('sindresorhus/object-assign');
var toString = require('../renderer/string');
var Entity = require('../scene/entity');

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
    var scene = new Scene(container, this, props);
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
