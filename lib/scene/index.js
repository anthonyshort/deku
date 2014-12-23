
/**
 * Module dependencies
 */

var loop = require('./loop');
var Entity = require('../entity');
var Emitter = require('component/emitter');
var Interactions = require('./interactions');
var assign = require('sindresorhus/object-assign');

/**
 * Expose `Scene`
 *
 * @type {Function}
 */

module.exports = Scene;

/**
 * A scene renders a component tree to an element
 * and manages the lifecycle and events each frame.
 *
 * @param {HTMLElement} container
 * @param {Entity} entity
 */

function Scene(container, Component, props) {
  this.container = container;
  this.interactions = new Interactions(container);
  this.entity = new Entity(Component, props, this);
  this.entity.appendTo(this.container);
  this.loop = loop()
    .on('tick', this.tick.bind(this));
}

assign(Scene.prototype, Emitter.prototype);

/**
 * Force update all the components
 */

Scene.prototype.forceUpdate = function(){
  this.entity.update(true);
  this.emit('update');
};

/**
 * Schedule this component to be updated on the next frame.
 *
 * @param {Function} done
 * @return {void}
 */

Scene.prototype.update = function(){
  this.entity.update();
  this.emit('update');
};

/**
 * Set new props on the component and trigger a re-render.
 *
 * TODO: could we use promises instead of callbacks?
 *
 * @param {Object} newProps
 * @param {Function} [done]
 */

Scene.prototype.setProps = function(newProps, done){
  if (done) this.once('update', done);
  this.entity.setProps(newProps);
};

/**
 * Remove the component from the DOM.
 */

Scene.prototype.remove = function(){
  this.loop.pause();
  this.entity.remove();
  this.interactions.remove();
};

/**
 * Is this scene dirty and needs a re-render?
 *
 * @return {Boolean}
 */

Scene.prototype.shouldUpdate = function(){
  return this.entity.isDirty();
};

/**
 * This gets called every frame of the browser
 * so we can update the tree efficiently.
 */

Scene.prototype.tick = function(){
  if (this.shouldUpdate()) this.update();
};