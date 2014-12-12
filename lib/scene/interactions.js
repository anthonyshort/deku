
var delegate = require('component/delegate');
var throttle = require('component/per-frame');

/**
 * Expose `Interactions`.
 */

module.exports = Interactions;

/**
 * Handle events for a component.
 *
 * @param {HTMLElement} el
 */

function Interactions(namespace, el) {
  this.el = el;
  this._handlers = {};
  this.namespace = namespace;
}

/**
 * Bind events for an element, and all it's rendered child elements.
 *
 * @param {String} path
 * @param {String} event
 * @param {Function} fn
 */

Interactions.prototype.bind = function(path, event, fn){
  var handlers = this._handlers[path] || {};
  this._handlers[path] = handlers;
  handlers[event] = throttle(fn);
  delegate.bind(this.el, '[data-path="'+ this.namespace + ':' + path +'"]', event, handlers[event], true);
};

/**
 * Unbind a single event from a path
 *
 * @param {String} path
 * @param {String} event
 */

Interactions.prototype.unbind = function(path, event){
  var handlers = this._handlers[path];
  if (!handlers) return;
  delegate.unbind(this.el, event, handlers[event]);
  delete handlers[event];
};

/**
 * Unbind all events at a path
 *
 * @param {String} path
 */

Interactions.prototype.unbindAll = function(path){
  var handlers = this._handlers[path];
  if (!handlers) return;
  for (var event in handlers) {
    this.unbind(path, event);
  }
  delete this._handlers[path];
};

/**
 * After render, finally bind event listeners.
 */

Interactions.prototype.remove = function(){
  for (var path in this._handlers) {
    this.unbindAll(path);
  }
  this._handlers = {};
};