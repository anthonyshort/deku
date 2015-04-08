
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var assign = require('extend');
var uid = require('get-uid');

/**
 * Expose `Entity`.
 */

module.exports = Entity;

/**
 * A rendered component instance.
 *
 * This manages the lifecycle, props and state of the component.
 *
 * @param {Function} component
 * @param {Object} props
 */

function Entity(component, props) {
  this.id = uid();
  this.options = component.options;
  this.props = props || {};
  this.component = component;
  this.state = this.component.initialState(this.props);
  this.lifecycle = null;
  this._pendingProps = assign({}, this.props);
  this._pendingState = assign({}, this.state);
  this.dirty = false;
}

/**
 * Mixins.
 */

Emitter(Entity.prototype);

/**
 * Get an option
 *
 * @param {String} name
 *
 * @return {*}
 */

Entity.prototype.option = function(name) {
  return this.options[name];
};

/**
 * Commit the changes.
 *
 * @return {Node}
 */

Entity.prototype.commit = function(){
  this.state = this._pendingState;
  this.props = this._pendingProps;
  this._pendingState = assign({}, this.state);
  this._pendingProps = assign({}, this.props);
  this.dirty = false;
};

/**
 * Release this entity for GC
 */

Entity.prototype.release = function(){
  this.off();
};

/**
 * Should this entity be updated and rendered?
 *
 * @param {Object} nextState
 * @param {Object} nextProps
 *
 * @return {Boolean}
 */

Entity.prototype.shouldUpdate = function(){
  if (!this.dirty) return false;
  var nextState = this._pendingState;
  var nextProps = this._pendingProps;
  return this.component.shouldUpdate(this.props, this.state, nextProps, nextState);
};
