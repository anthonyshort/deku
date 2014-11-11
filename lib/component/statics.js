
/**
 * Dependecies
 */

var merge = require('yields/merge');

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

exports.mount = function(el, props) {
  var component = new this.constructor(props);
  var rendered = new Rendered(component);
}