
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var assign = require('extend');
var uid = require('get-uid');

/**
 * Prevent calling setState in these lifecycle states
 *
 * @type {Object}
 */

var preventSetState = {
  beforeUpdate: "You can't call setState in the beforeUpdate hook. Use the propsChanged hook instead.",
  render: "You can't call setState in the render hook. This method must remain pure."
};

/**
 * Expose `Entity`.
 */

module.exports = Entity;

/**
 * A rendered component instance.
 *
 * This manages the lifecycle, props and state of the component.
 *
 * @param {Function} Component
 * @param {Object} props
 */

function Entity(Component, props) {
  this.id = uid();
  this.type = Component;
  this.props = props || {};
  this.component = this.instance(Component);
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
 * Create the component instance
 *
 * @param {Component} Component
 *
 * @return {Object}
 */

Entity.prototype.instance = function(Component) {
  var component = new Component();
  component.on('change', this.setState.bind(this));
  component.on('invalidate', this.invalidate.bind(this));
  return component;
};

/**
 * Get an updated version of the virtual tree.
 *
 * @return {VirtualTree}
 */

Entity.prototype.render = function(){
  this.lifecycle = 'render';
  var result = this.component.render(this.props, this.state);
  this.lifecycle = null;
  return result;
};

/**
 * Merge in new props.
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

Entity.prototype.setProps = function(nextProps, done){
  if (done) this.once('afterUpdate', done);
  this._pendingProps = assign(this._pendingProps, nextProps);
  this.propsChanged(this._pendingProps);
  this.invalidate();
};

/**
 * Replace all the properties
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

Entity.prototype.replaceProps = function(nextProps, done){
  if (done) this.once('afterUpdate', done);
  this._pendingProps = nextProps;
  this.propsChanged(this._pendingProps);
  this.invalidate();
};

/**
 * Set the state. This can be called multiple times
 * and the state will be MERGED.
 *
 * @param {Object} nextState
 * @param {Function} done
 */

Entity.prototype.setState = function(nextState, done){
  checkSetState(this.lifecycle);
  if (done) this.once('afterUpdate', done);
  this._pendingState = assign(this._pendingState, nextState);
  this.invalidate();
};

/**
 * Schedule this component to be updated on the next frame.
 */

Entity.prototype.invalidate = function(){
  this.dirty = true;
  this.emit('change');
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

/**
 * Trigger `beforeUpdate` lifecycle hook.
 *
 * @param {Object} nextState
 * @param {Object} nextProps
 */

Entity.prototype.beforeUpdate = function(nextProps, nextState){
  this.trigger('beforeUpdate', [this.props, this.state, nextProps, nextState]);
};

/**
 * Trigger `afterUpdate` lifecycle hook.
 *
 * @param {Object} previousState
 * @param {Object} previousProps
 */

Entity.prototype.afterUpdate = function(previousState, previousProps){
  this.trigger('afterUpdate', [this.props, this.state, previousProps, previousState]);
};

/**
 * Trigger `beforeUnmount` lifecycle hook.
 *
 * @param {HTMLElement} el
 */

Entity.prototype.beforeUnmount = function(el){
  this.trigger('beforeUnmount', [el, this.props, this.state]);
};

/**
 * Trigger `afterUnmount` lifecycle hook.
 */

Entity.prototype.afterUnmount = function(){
  this.trigger('afterUnmount', [this.props, this.state]);
};

/**
 * Trigger `beforeMount` lifecycle hook.
 */

Entity.prototype.beforeMount = function(){
  this.trigger('beforeMount', [this.props, this.state]);
};

/**
 * Trigger `afterMount` lifecycle hook.
 *
 * @param {HTMLElement} el
 */

Entity.prototype.afterMount = function(el){
  this.trigger('afterMount', [el, this.props, this.state]);
};

/**
 * Trigger `propsChanged` lifecycle hook.
 */

Entity.prototype.propsChanged = function(nextProps){
  this.trigger('propsChanged', [nextProps, this.props, this.state]);
};

/**
 * Trigger a method on the component instance and call a matching
 * event on the Component constructor. This event can be used by
 * plugins to hook into lifecycle methods.
 *
 * @param {String} name
 * @param {Array} args
 * @private
 */

Entity.prototype.trigger = function(name, args){
  this.lifecycle = name;
  if (typeof this.component[name] === 'function') {
    this.component[name].apply(this.component, args);
  }
  this.type.emit.apply(this.type, [name, this.component].concat(args));
  this.lifecycle = null;
  this.emit(name);
};

/**
 * Determine whether it is possible to set state during a
 * lifecycle method.
 *
 * @param {String} lifecycle
 */

function checkSetState(lifecycle) {
  var message = preventSetState[lifecycle];
  if (message) throw new Error(message);
}