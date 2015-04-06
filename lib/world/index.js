var Entity = require('../renderer/dom/entity');
var Emitter = require('component-emitter');

/**
 * Expose `World`.
 */

module.exports = World;

/**
 * Create a new `World`.
 */

function World(component) {
  if (!(this instanceof World)) return new World;
  this.options = {};
  this.debug = false;

  if (typeof window !== 'undefined') {
    // TODO: DOM is a sort of plugin to the world.
    require('../renderer/dom')(this);
  }
}

Emitter(World.prototype);

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
 * Send message to the world.
 *
 * @param {String} type
 * @param {Object} data
 */

World.prototype.send = function(type, data){
  this.emit(type, data);
};

/**
 * Easy way to test updating properties on components.
 *
 * @param {String|Integer} path Defaults to 0 for api sugar.
 */

World.prototype.setProps =
World.prototype.update = function(path, data){
  if (1 == arguments.length) {
    this.send('update component', 0, path);
  } else {
    this.send('update component', path, data);
  }
};

/**
 * Set global world options.
 */

World.prototype.set = function(key, val){
  this.options[key] = val;
  return this;
};

/**
 * Mount component into world.
 */

World.prototype.mount = function(element, component, properties){
  var path = 0; // TODO: only supporting 1 root element for the moment.
  this.send('mount component', {
    properties: properties || {},
    component: component,
    element: element,
    path: String(path)
  });
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
