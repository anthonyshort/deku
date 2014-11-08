
/**
 * Renderer
 *
 * The renderer is a singleton object that handles rendering
 * components when they have changed. It batches these changes
 * and executes them on the next frame.
 */

/**
 * Module dependencies.
 */

var frame = require('anthonyshort/raf-queue');
var diff = require('./diff');

/**
 * Dirty component queue.
 */

var dirty = [];

/**
 * Add a component to the render queue.
 *
 * @param {Component} component
 * @param {Object} state State it will update to.
 */

exports.add = function(component){
  if (dirty.indexOf(component) > -1) return;
  dirty.push(component);
  frame.once(exports.render);
};

/**
 * Render the dirty queue.
 *
 * This should typically happen on the next frame.
 *
 * @api public
 */

exports.render = function(){
  while (dirty.length) {
    dirty.pop().update();
  }
};

/**
 * Mount.
 *
 * @param {Object} props
 * @param {Array} children
 * @api public
 */

exports.mount = function(Component, container, props) {
  var component = new Component(props);
  var rendered = new RenderedComponent(component);
  rendered.mount(container);
  return rendered;
}