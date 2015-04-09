
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var rendering = require('./renderer/dom');
var dataflow = require('./io/data');

/**
 * Expose `Application`.
 */

module.exports = Application;

/**
 * Create a new `Application`.
 */

function Application() {
  if (!(this instanceof Application)) return new Application;
  this.options = {};
  this.debug = false;
  this.rootIndex = 0;

  if (typeof window !== 'undefined') {
    this.use(rendering);
    this.use(dataflow);
  }
}

/**
 * Mixin `Emitter`.
 */

Emitter(Application.prototype);

/**
 * Add a plugin
 *
 * @param {Function} plugin
 */

Application.prototype.use = function(plugin){
  plugin(this);
  return this;
};

/**
 * Send message to the world.
 *
 * @param {String} type
 * @param {Object} data
 */

Application.prototype.send = function(type, data){
  this.emit(type, data);
};

/**
 * Easy way to test updating properties on components.
 *
 * @param {String|Integer} path Defaults to 0 for api sugar.
 */

Application.prototype.setProps =
Application.prototype.update = function(path, properties){
  var data = 1 == arguments.length
    ? { path: '0', properties: path }
    : { path: String(path), properties: properties };
  this.send('update component', data);
};

/**
 * Set global world options.
 */

Application.prototype.set = function(key, val){
  this.options[key] = val;
  return this;
};

/**
 * Register data source name.
 *
 * @param {String} name
 */

Application.prototype.source = function(name, fn){
  this.send('subscribe', { name: name, fn: fn });
  return this;
};

/**
 * Mount component into world.
 */

Application.prototype.mount = function(element, component, properties){
  var path = this.rootIndex.toString(16);
  this.rootIndex++;
  this.send('mount component', {
    properties: properties || {},
    component: component,
    element: element,
    path: path
  });
};

/**
 * Remove the world. Unmount everything.
 */

Application.prototype.remove = function(){
  // TODO: for now, only supports 1 component
  this.send('unmount component', {
    path: '0'
  });
};
