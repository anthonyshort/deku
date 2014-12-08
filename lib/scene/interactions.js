
/**
 * Module dependencies.
 */

var events = require('component/event');
var bind = require('component/bind');

/**
 * Events to handle.
 */

var eventTypes = [
  'onmouseover',
  'onmouseout',
  'onkeypress',
  'onkeydown',
  'onchange',
  'onclick',
  'onfocus',
  'onkeyup',
  'onblur'
];

/**
 * Expose `Interactions`.
 */

module.exports = Interactions;

/**
 * Handle events for a component.
 *
 * @param {Entity} entity
 */

function Interactions(entity) {
  this.entity = entity;
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
 * Determine if an attribute is an event
 *
 * @param {String} val
 *
 * @return {Boolean}
 */

Interactions.isEvent = function(val) {
  return eventTypes.indexOf(val) > -1;
};

/**
 * Initialize the event handling.
 *
 * TODO: would be nice if there is a way to not have to initialize this.
 */

Interactions.prototype.init = function(){
  var handlers = this.handlers;
  var el = this.entity.el;
  for (var type in handlers) {
    events.bind(el, type.replace(/^on/, ''), this[type]);
  }
};

/**
 * Bind events for an element, and all it's rendered child elements.
 *
 * @param {HTMLElement} el
 * @param {String} type
 * @param {Function} fn
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
    el = this.entity.el;
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
  fn.call(this.entity.component, e, this.entity.state, this.entity.props);
};
