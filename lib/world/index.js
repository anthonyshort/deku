var Entity = require('../entity');

/**
 * Expose the factory function to create
 * scene objects that can be rendered.
 */

module.exports = function(component){
  return new World(component);
};

/**
 * A scene renders a component tree to an element
 * and manages the lifecycle and events each frame.
 *
 * @param {Object} component
 */

function World(component) {
  this.root = new Entity(component);
  this.debug = false;
}

/**
 * Add a plugin
 *
 * @param {Function} plugin
 */

World.prototype.use = function(plugin){
  plugin(this);
  return this;
};

/**
 * Set new props on the component and trigger a re-render.
 *
 * @param {Object} newProps
 */

World.prototype.setProps = function(newProps){
  this.root.setProps(newProps);
  return this;
};

/**
 * Replace all the props on the current entity
 *
 * @param {Objct} newProps
 */

World.prototype.replaceProps = function(newProps){
  this.root.replaceProps(newProps);
  return this;
};
