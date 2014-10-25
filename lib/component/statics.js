
/**
 * Dependecies
 */

var merge = require('yields/merge');
var renderer = require('../renderer');
var Node = require('../node');

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

/**
 * Mount.
 *
 * @param {Object} props
 * @param {Array} children
 * @api public
 */

exports.mount = function(container, props) {
  // TODO: this is a little crappy because it duplicates
  // the functionality in dom
  var node = new Node('component', this, null, {
    props: props
  });
  var rootId = renderer.cache(container);
  node.create(rootId, rootId + '.' + 0);
  var el = node.render();
  container.appendChild(el);
}