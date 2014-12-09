
/**
 * Events to handle.
 */

var eventTypes = {
  'onmouseover': 'mouseover',
  'onmouseout': 'mouseout',
  'onkeypress': 'keypress',
  'onkeydown': 'keydown',
  'onchange': 'change',
  'onclick': 'click',
  'onfocus': 'focus',
  'onkeyup': 'keyup',
  'onblur': 'blur'
};

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
  this._handle = this.handle.bind(this);
  for (var key in eventTypes) {
    var eventName = eventTypes[key];
    this.el.addEventListener(eventName, this._handle, true);
  }
}

/**
 * Bind events for an element, and all it's rendered child elements.
 *
 * @param {String} path
 * @param {String} type
 * @param {Function} fn
 */

Interactions.prototype.bind = function(path, type, fn){
  var handlers = this.handlers[path];
  if (!handlers) handlers = this.handlers[path] = {};
  handlers[type] = fn;
};

/**
 * Unbind events.
 *
 * @param {String} path
 * @param {String} type
 */

Interactions.prototype.unbind = function(path, type){
  var handlers = this.handlers[path];
  if (!handlers) return;
  if (type) {
    delete handlers[type];
  } else {
    delete this.handlers[path];
  }
};

/**
 * After render, finally bind event listeners.
 */

Interactions.prototype.remove = function(){
  this.handlers = {};
  for (var key in eventTypes) {
    var eventName = eventTypes[key];
    this.el.removeEventListener(eventName, this._handle);
  }
};

/**
 * Generically handle each event type.
 */

Interactions.prototype.handle = function(e){
  var el = e.target;
  var type = e.type;
  var handlers = this.handlers[el.__path__];
  var fn = handlers[type];
  if (fn) fn(e);
};
