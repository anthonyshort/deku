
/**
 * Dependecies
 */

var merge = require('yields/merge');
var renderer = require('../renderer');
var dom = require('../dom');

/**
 * Properties.
 *
 * @return {Component}
 * @api public
 */

exports.prop = function(key, options){
  this.props[key] = options;
  return this;
}

/**
 * State.
 *
 * @return {Component}
 * @api public
 */

exports.state = function(key, options){
  this.states[key] = options;
  return this;
}

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