
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var uid = require('get-uid');

/**
 * Expose `Value`.
 */

module.exports = Value;

/**
 * Initialize a new `Value`.
 *
 * Really this is the last object of a stream,
 * or the computed subset of objects.
 *
 * It's a functional-esque value. You shouldn't have
 * to think about it ever in userland.
 *
 * This object may turn out to be the same thing as the `IO` object.
 *
 * Essentially this is all optimization.
 * We're building a data structure to use to both
 * act as a dsl for definiting "immutable" transducers,
 * and also be used as a "description" for the IO network.
 */

function Value(type, parent, modifier) {
  // it's a top-level value if..
  if (!(this instanceof Value)) return new Value(type, parent, modifier);
  this.modifier = modifier;
  this.parent = parent;
  this.type = type;
  this.id = uid();
}

/**
 * TODO: not sure if this should be an emitter, but doing it for now.
 */

Emitter(Value.prototype);

Value.prototype.map = function(fn){
  return new Value('map', this, fn);
};

Value.prototype.filter = function(fn){
  return new Value('filter', this, fn);
};

Value.prototype.interval = function(ms){
  // TODO: this is really sort of a composition of two or maybe more values.
  return new Value('interval', this, ms);
};

Value.prototype.defaultTo = function(value){
  return Value('default', this, defaultTo(value));
};

Value.prototype.equal = function(key, val){
  return new Value('equal', this, equal(key, val));
};

Value.prototype.pick = function(key){
  return new Value('pick', this, pick(key));
};

/**
 * TODO: This object should just be a "definition" object,
 * and should have this event handling stuff. Decouple later.
 *
 * This gets called from `IO`, which pipes the value to it.
 */

Value.prototype.send = function(data){
  // cache it for setting value when new components are created.
  if (this.modifier) {
    data = this._currentValue = this.modifier(data);
  } else {
    data = this._currentValue = data;
  }
  this.emit('change', data);
};

/**
 * Get last value to this "value stream".
 *
 * @return {Mixed} current value
 */

Value.prototype.get = function(){
  return this._currentValue;
};

function equal(key, val) {
  var getter = key;
  if ('function' != typeof getter) {
    getter = function(data){
      return data[key];
    };
  }
  return function(data){
    return val === getter(data);
  };
}

function defaultTo(value) {
  return function(data, key) {
    if (null == data[key]) return value;
    return data[key];
  };
}

function pick(key) {
  return function(data) {
    return data[key];
  };
}
