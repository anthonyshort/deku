
/**
 * Module dependencies.
 */

var renderString = require('../renderer/string');
var Entity = require('../entity');
var Scene = require('../scene');

/**
 * Browser dependencies.
 */

if (typeof window !== 'undefined') {
  var HTMLRenderer = require('../renderer/html');
}

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
    for (var k in plugin) this.prototype[k] = plugin[k];
  }
  return this;
};

/**
 * Define a property
 *
 * @param {String} name
 * @param {Object} options
 */

exports.prop = function(name, options){
  this.props[name] = options;
  return this;
};

/**
 * Connect to channels
 *
 * @param {String} name
 */

exports.channel = function(name){
  this.channels.push(name);
  return this;
};

/**
 * Mount this component to a node. Only available
 * in the browser as it requires the DOM.
 *
 * @param {HTMLElement} container
 * @param {Object} props
 */

exports.render = function(container, props){
  if (!HTMLRenderer) throw new Error('You can only render a DOM tree in the browser. Use renderString instead.');
  var renderer = new HTMLRenderer(container);
  var entity = new Entity(this, props);
  var scene = new Scene(renderer, entity);
  return scene;
};

/**
 * Render this component to a string.
 *
 * @param {Object} props
 */

exports.renderString = function(props){
  var entity = new Entity(this, props);
  return renderString(entity);
};
