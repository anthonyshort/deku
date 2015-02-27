
/**
 * Module dependencies
 */

var Emitter = require('component-emitter');
var loop = require('raf-loop');

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

function Scene(renderer, entity) {
  this.loop = loop(this.update.bind(this));
  this.renderer = renderer;
  this.entity = entity;
  this.resume();
}

Emitter(Scene.prototype);

/**
 * Add a plugin
 *
 * @api public
 */

Scene.prototype.use = function(plugin){
  plugin(this);
  return this;
};

/**
 * Schedule this component to be updated on the next frame.
 *
 * @param {Function} done
 * @return {void}
 */

Scene.prototype.update = function(){
  try {
    this.renderer.render(this.entity);
  } catch(e) {
    this.pause();
    throw e;
  }
  return this;
};

/**
 * Set new props on the component and trigger a re-render.
 *
 * @param {Object} newProps
 * @param {Function} [done]
 */

Scene.prototype.setProps = function(newProps, done){
  this.entity.setProps(newProps, done);
};

/**
 * Replace all the props on the current entity
 *
 * @param {Objct} newProps
 * @param {Function} done
 *
 * @return {Promise}
 */

Scene.prototype.replaceProps = function(newProps, done){
  this.entity.replaceProps(newProps, done);
};

/**
 * Remove the scene from the DOM.
 */

Scene.prototype.remove = function(){
  this.pause();
  this.renderer.remove();
  this.off();
};

/**
 * Resume updating the scene
 */

Scene.prototype.resume = function(){
  this.loop.start();
  this.emit('resume');
  return this;
};

/**
 * Stop updating the scene
 */

Scene.prototype.pause = function(){
  this.loop.stop();
  this.emit('pause');
  return this;
};