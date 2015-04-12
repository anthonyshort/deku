
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var rendering = require('./renderer/dom');

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
  this.store = {};
  this.connections = {};
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

Application.prototype.source = function(name, val){
  this.store[name] = val;
  return this;
};

/**
 * Set value used somewhere in the IO network.
 */

Application.prototype.value = function(name, data){
  if (this.store[name] === data) return;
  this.store[name] = data; // update global store.
  this.connections[name](data);
};

/**
 * Mount component into world.
 */

Application.prototype.mount = function(virtualElement){
  this.node = virtualElement;
  this.emit('mount', node);
};

/**
 * Remove the world. Unmount everything.
 */

Application.prototype.unmount = function(){
  this.node = null;
  this.emit('unmount');
};
