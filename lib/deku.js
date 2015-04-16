
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var stringify = require('./stringify');

/**
 * Expose `Deku`.
 */

module.exports = Deku;

/**
 * Create a new `Deku`.
 */

function Deku() {
  if (!(this instanceof Deku)) return new Deku;
  this.options = {};
  this.rootIndex = 0;
  this.store = {};
  this.connections = {};
}

/**
 * Mixin `Emitter`.
 */

Emitter(Deku.prototype);

/**
 * Add a plugin
 *
 * @param {Function} plugin
 */

Deku.prototype.use = function(plugin){
  plugin(this);
  return this;
};

/**
 * Send message to the world.
 *
 * @param {String} type
 * @param {Object} data
 */

Deku.prototype.update = function(type, data){
  this.emit(type, data);
};

/**
 * Register data source name.
 *
 * @param {String} name
 */

Deku.prototype.source = function(name, fn){
  this.store[name] = val;
  return this;
};

/**
 * Set an option
 *
 * @param {String} name
 */

Deku.prototype.set = function(name, val){
  this.options[name] = val;
  return this;
};

/**
 * Set value used somewhere in the IO network.
 */

Deku.prototype.value = function(name, data){
  if (this.store[name] === data) return;
  this.store[name] = data; // update global store.
  this.connections[name](data);
};

/**
 * Mount a virtual element.
 *
 * @param {VirtualElement} virtualElement
 */

Deku.prototype.mount = function(virtualElement){
  this.emit('mount', virtualElement);
};

/**
 * Remove the world. Unmount everything.
 */

Deku.prototype.unmount = function(){
  this.emit('unmount');
};

/**
 * Render the current element to a string
 *
 * @param {Object} options The rendering options
 */

Deku.prototype.renderString = function(options){
  if (!this.el) return mountError();
  return stringify(this, options);
};

/**
 * Render the current element to the DOM.
 *
 * @param {HTMLElement} container Append to this element
 * @param {Object} options The rendering options
 */

Deku.prototype.render = function(container, options){
  if (!this.el) return mountError();
  if (!render) return DOMError();
  return render(this, container, options);
};

/**
 * Throw an error for a missing mount
 */

function mountError() {
  throw new Error('There is no mounted element. Mount an element first, then call this function.')
}

/**
 * No available DOM.
 */

function DOMError() {
  throw new Error('This environment does not have DOM support.');
}
