
/**
 * Module dependencies.
 */

var events = require('component/event');
var bind = require('component/bind');

/**
 * Events to handle.
 */

var eventTypes = [
  'onclick',
  'onfocus',
  'onblur',
  'onmouseover',
  'onmouseout',
  'onkeypress',
  'onkeyup',
  'onkeydown',
  'onchange'
];

/**
 * Expose `Interactions`.
 */

module.exports = Interactions;

/**
 * Handle events for a component.
 *
 * @param {ComponentRenderer} renderer
 */

function Interactions(renderer) {
  this.renderer = renderer;
  this.handlers = {};
  var handler = bind(this, this.handle);
  var self = this;
  eventTypes.forEach(function(type){
    self[type] = function(e){
      handler.call(self, type, e);
    }
  });
}

/**
 * Initialize the event handling.
 */

Interactions.prototype.init = function(){
  var handlers = this.handlers;
  var el = this.renderer.el;
  for (var type in handlers) {
    events.bind(el, type.replace(/^on/, ''), this[type]);
  }
};

/**
 * Bind events for an element, and all it's rendered child elements.
 *
 * @param {HTMLElement} el
 * @param {String} type
 */

Interactions.prototype.bind = function(el, type, fn){
  var handlers = this.handlers[type];
  if (!handlers) handlers = this.handlers[type] = {};
  var path = el.__path__;
  handlers[path] = fn;
};

/**
 * Unbind events.
 *
 * @param {HTMLElement} el
 * @param {String} type
 */

Interactions.prototype.unbind = function(el, type){
  var handlers = this.handlers[type];
  if (!handlers) return;
  if (el) {
    // unbind event for specific element.
    var path = el.__path__;
    delete handlers[path];
  } else {
    // unbind all events of that type.
    delete this.handlers[type];
    el = this.renderer.el;
    events.unbind(el, type);
  }
};

/**
 * After render, finally bind event listeners.
 */

Interactions.prototype.remove = function(){
  var handlers = this.handlers;
  for (var type in handlers) {
    this.unbind(null, type);
  }
};

/**
 * Generically handle each event type.
 */

Interactions.prototype.handle = function(type, e){
  var handlers = this.handlers[type];
  var el = e.target;
  var path = el.__path__;
  var fn = handlers[path];
  if (!fn) return;

  // call with the component instance as context.
  fn.call(this.instance, el, this.state, this.props);
};
