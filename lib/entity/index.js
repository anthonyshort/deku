
/**
 * Module dependencies.
 */

var camel = require('ianstormtaylor/to-camel-case');
var assign = require('sindresorhus/object-assign');
var Emitter = require('component/emitter');
var equals = require('jkroso/equals');
var each = require('component/each');
var virtual = require('../virtual');

/**
 * ID counter.
 */

var i = 0;

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
  this.id = (++i).toString(32);
  this.type = Component;
  this.props = props || {};
  this.component = this.createComponent(Component);
  this.state = this.component.initialState(this.props);
  this.children = {};
  this.current = this.render();
  this.previous = null;
  this.dirty = false;
  this.lifecycle = null;
  this._pendingProps = null;
  this._pendingState = null;
  this._propsReplaced = false;
}

/**
 * Entity is an emitter.
 */

Emitter(Entity.prototype);

/**
 * Create the component instance
 *
 * @param {Component} Component
 *
 * @return {Object}
 */

Entity.prototype.createComponent = function(Component) {
  var component = new Component();
  component.on('change', this.setState.bind(this));
  return component;
};

/**
 * Get an updated version of the virtual tree.
 *
 * @return {VirtualTree}
 */

Entity.prototype.render = function(){
  this.lifecycle = 'rendering';
  var node = this.component.render(this.props, this.state);
  this.lifecycle = null;
  if (!node) {
    node = virtual.node('noscript');
  }
  return virtual.tree(node);
};

/**
 * Set the props.
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

Entity.prototype.setProps = function(nextProps, done){
  if (done) this.once('update', done);
  this._pendingProps = assign(this._pendingProps || {}, nextProps);
  this.propsChanged(nextProps);
  this.invalidate();
};

/**
 * Replace all the properties
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

Entity.prototype.replaceProps = function(nextProps, done){
  if (done) this.once('update', done);
  this._propsReplaced = true;
  this._pendingProps = nextProps;
  this.propsChanged(nextProps);
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
  if (this.lifecycle === 'beforeUpdate') {
    throw new Error('You can\'t call setState in the beforeUpdate hook. Use the propsChanged hook instead.');
  }
  if (this.lifecycle === 'rendering') {
    throw new Error('You can\'t call setState in the render hook. This method must remain pure.');
  }
  if (done) this.once('update', done);
  this._pendingState = assign(this._pendingState || {}, nextState);
  this.invalidate();
};

/**
 * Schedule this component to be updated on the next frame.
 */

Entity.prototype.invalidate = function(){
  this.dirty = true;
  if (this.scene) this.scene.dirty = true;
};

/**
 * Add an entity as a child of this entity
 *
 * @param {String} path
 * @param {Entity} entity
 */

Entity.prototype.addChild = function(path, Component, props){
  var child = new Entity(Component, props);
  this.children[path] = child;
  child.addToScene(this.scene);
  return child;
};

/**
 * Get the child entity at a path
 *
 * @param {String} path
 *
 * @return {Entity}
 */

Entity.prototype.getChild = function(path) {
  return this.children[path];
};

/**
 * Get the path of a node in it's current tree
 *
 * @param {Node} node
 *
 * @return {String}
 */

Entity.prototype.getPath = function(node) {
  return this.current.getPath(node);
};

/**
 * Add this entity to a Scene. Whenever this entity
 * is changed, it will mark the scene as dirty.
 *
 * @param {Scene} scene
 */

Entity.prototype.addToScene = function(scene){
  this.scene = scene;
};

/**
 * Remove an entity from this component and return it.
 *
 * @param {String} path
 *
 * @return {Entity}
 */

Entity.prototype.removeChild = function(path){
  var entity = this.children[path];
  entity.scene = null;
  delete this.children[path];
  return entity;
};

/**
 * Should this entity be updated and rendered?
 *
 * @param {Object} nextState
 * @param {Object} nextProps
 *
 * @return {Boolean}
 */

Entity.prototype.shouldUpdate = function(nextState, nextProps){
  if (nextProps && !equals(nextProps, this.props)) {
    return true;
  }
  if (nextState && !equals(nextState, this.state)) {
    return true;
  }
  return false;
};

/**
 * Update the props on the component.
 *
 * @return {Node}
 */

Entity.prototype.update = function(){
  var nextProps;

  // If we've flagged that we want all of the props replaced, we
  // won't merge it in, we'll replace it entirely.
  if (this._propsReplaced) {
    nextProps = this._pendingProps;
    this._propsReplaced = false;
  } else {
    nextProps = assign({}, this.props, this._pendingProps);
  }

  var nextState = assign({}, this.state, this._pendingState);

  // Compare the state and props to see if we really need to render
  if (!this.shouldUpdate(nextState, nextProps)) return false;

  // pre-update. This callback could mutate the
  // state or props just before the render occurs
  this.beforeUpdate(nextState, nextProps);

  // commit the changes.
  var previousState = this.state;
  var previousProps = this.props;
  this.state = nextState;
  this.props = nextProps || this.props;

  // reset.
  this._pendingState = null;
  this._pendingProps = null;

  // remove the force flag.
  delete this.state.__force__;

  // Signal that something changed
  return true;
};

/**
 * Set the current version of the tree and mark this
 * entity as not dirty. This is called once the entity
 * has been rendered/updated on the scene.
 *
 * @param {Tree} tree
 */

Entity.prototype.setCurrent = function(tree){
  this.previous = this.current;
  this.current = tree;
  this.dirty = false;
};

/**
 * Remove the component from the DOM.
 */

Entity.prototype.remove = function(){
  this.off();
  each(this.children, function(path, child){
    child.remove();
  });
  this.children = {};
};

/**
 * Connect to all off the channels on the scene
 */

Entity.prototype.connect = function(){
  var channels = this.channels = {};
  var scene = this.scene;
  this.type.channels.forEach(function(name){
    var socket = scene.channel(name).connect();
    channels[camel(name)] = socket;
  });
};

/**
 * Disconnect from all of the channels
 */

Entity.prototype.disconnect = function(){
  for (var name in this.channels) {
    var socket = this.channels[name];
    socket.disconnect();
  }
  delete this.channels;
};

/**
 * Get the props object that is passed into the hook functions.
 * This includes extra props that are sent to the user but
 * don't necessarily update the view.
 *
 * @return {Object}
 */

Entity.prototype.getProps = function(){
  var props = Object.create(this.props);
  props.channels = this.channels;
  return props;
};

/**
 * Trigger `beforeUpdate` lifecycle hook.
 *
 * @param {Object} nextState
 * @param {Object} nextProps
 */

Entity.prototype.beforeUpdate = function(nextState, nextProps){
  var props = this.getProps();
  this.lifecycle = 'beforeUpdate';
  this.component.beforeUpdate(props, this.state, nextProps, nextState);
  this.type.emit('beforeUpdate', this.component, props, this.state, nextProps, nextState);
  this.lifecycle = null;
};

/**
 * Trigger `afterUpdate` lifecycle hook.
 *
 * @param {Object} previousState
 * @param {Object} previousProps
 */

Entity.prototype.afterUpdate = function(previousState, previousProps){
  var props = this.getProps();
  this.emit('update');
  this.component.afterUpdate(props, this.state, previousProps, previousState);
  this.type.emit('afterUpdate', this.component, props, this.state, previousProps, previousState);
};

/**
 * Trigger `beforeUnmount` lifecycle hook.
 *
 * @param {HTMLElement} el
 */

Entity.prototype.beforeUnmount = function(el){
  var props = this.getProps();
  this.component.beforeUnmount(el, props, this.state);
  this.type.emit('beforeUnmount', this.component, el, props, this.state);
};

/**
 * Trigger `afterUnmount` lifecycle hook.
 */

Entity.prototype.afterUnmount = function(){
  this.disconnect();
  var props = this.getProps();
  this.component.afterUnmount(props, this.state);
  this.type.emit('afterUnmount', this.component, props, this.state);
};

/**
 * Trigger `beforeMount` lifecycle hook.
 */

Entity.prototype.beforeMount = function(){
  this.connect();
  var props = this.getProps();
  this.component.beforeMount(props, this.state);
  this.type.emit('beforeMount', this.component, props, this.state);
};

/**
 * Trigger `afterMount` lifecycle hook.
 *
 * @param {HTMLElement} el
 */

Entity.prototype.afterMount = function(el){
  var props = this.getProps();
  this.component.afterMount(el, props, this.state);
  this.type.emit('afterMount', this.component, el, props, this.state);
};

/**
 * Trigger `propsChanged` lifecycle hook.
 *
 * @param {Object} nextProps
 */

Entity.prototype.propsChanged = function(nextProps){
  var props = this.getProps();
  this.component.propsChanged(nextProps, props, this.state);
  this.type.emit('propsChanged', this.component, nextProps, props, this.state);
};