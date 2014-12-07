
/**
 * Module dependencies
 */

var loop = require('./loop');
var Emitter = require('component/emitter');
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
 * TODO: move interactions here
 *
 * @param {HTMLElement} container
 * @param {ComponentRenderer} rendered
 */

function Scene(container, rendered) {
  this.rendered = rendered;
  this.container = container;
  this.loop = loop(this.tick.bind(this));
  this.rendered.appendTo(this.container);
}

assign(Scene.prototype, Emitter.prototype);

/**
 * Force update all the components
 */

Scene.prototype.forceUpdate = function(){
  this.rendered.update(true);
  this.emit('update');
};

/**
 * Schedule this component to be updated on the next frame.
 *
 * @param {Function} done
 * @return {void}
 */

Scene.prototype.update = function(){
  this.rendered.update();
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
  this.rendered.setProps(newProps);
};

/**
 * Remove the component from the DOM.
 */

Scene.prototype.remove = function(){
  this.loop.pause();
  this.rendered.remove();
};

/**
 * Is this scene dirty and needs a re-render?
 *
 * @return {Boolean}
 */

Scene.prototype.shouldUpdate = function(){
  return this.rendered.isDirty();
};

/**
 * This gets called every frame of the browser
 * so we can update the tree efficiently.
 */

Scene.prototype.tick = function(){
  if (this.shouldUpdate()) this.update();
};