
var throttle = require('per-frame');
var keypath = require('object-path');

/**
 * All of the events we will bind to
 */

var events = [
  'blur',
  'change',
  'click',
  'contextmenu',
  'copy',
  'cut',
  'dblclick',
  'drag',
  'dragend',
  'dragenter',
  'dragexit',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  'focus',
  'input',
  'keydown',
  'keyup',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'paste',
  'scroll',
  'submit',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'wheel'
];

/**
 * Expose `Interactions`.
 */

module.exports = Interactions;

/**
 * Handle events for a component.
 *
 * @param {HTMLElement} el
 */

function Interactions(el) {
  this.el = el;
  this.handlers = {};
  this.handle = this.handle.bind(this);
  this.resume();
}

/**
 * Bind events for an element, and all it's rendered child elements.
 *
 * @param {String} path
 * @param {String} event
 * @param {Function} fn
 */

Interactions.prototype.bind = function(namespace, path, event, fn){
  keypath.set(this.handlers, [namespace, path, event], throttle(fn));
};

/**
 * Unbind events for a namespace
 *
 * @param {String} namespace
 */

Interactions.prototype.unbind = function(namespace){
  delete this.handlers[namespace];
};

/**
 * Start listening for events
 */

Interactions.prototype.resume = function(){
  events.forEach(function(name){
    this.el.addEventListener(name, this.handle, true);
  }, this);
};

/**
 * Stop listening for events
 */

Interactions.prototype.pause = function(){
  events.forEach(function(name){
    this.el.removeEventListener(name, this.handle, true);
  }, this);
};

/**
 * After render, finally bind event listeners.
 */

Interactions.prototype.remove = function(){
  this.handlers = {};
  this.pause();
};

/**
 * Handle an event that has occured within the container
 *
 * @param {Event} event
 */

Interactions.prototype.handle = function(event){
  var target = event.target;
  var handlers = this.handlers;
  var renderDataId = target.__renderData__;
  var eventType = event.type;

  // Walk up the DOM tree and see if there is a handler
  // for this event type higher up.
  while (target && target.__renderData__ === renderDataId) {
    var fn = keypath.get(handlers, [renderDataId, target.__path__, eventType]);
    if (fn) {
      event.delegateTarget = target;
      fn(event);
      break;
    }
    target = target.parentNode;
  }
};
