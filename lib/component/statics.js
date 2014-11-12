
/**
 * Dependecies
 */

var merge = require('yields/merge');
var Mount = require('../mount');

/**
 * Use plugin.
 *
 * @param {Function|Object} plugin passing an object will extend the prototype
 * @return {Component}
 * @api public
 */

exports.use = function(plugin){
  if ('function' === typeof plugin) {
    plugin(this);
  }
  else {
    merge(this.prototype, plugin);
  }
  return this;
}

/**
 * Mount this component to a node
 */

exports.render = function(container, props) {
  var mount = new Mount(this, props);
  mount.to(container);
  return mount;
}

/**
 * Render this component to a string
 */

exports.renderToString = function(props) {

}