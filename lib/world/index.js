
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');

/**
 * Expose `World`.
 */

module.exports = World;

/**
 * Create a new `World`.
 */

function World() {
  if (!(this instanceof World)) return new World;
  this.options = {};
  this.debug = false;
  this.rootIndex = 0;

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
World.prototype.update = function(path, properties){
  var data = 1 == arguments.length
    ? { path: '0', properties: path }
    : { path: String(path), properties: properties };
  this.send('update component', data);
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
  var path = this.rootIndex.toString(16);
  this.rootIndex++;
  this.send('mount component', {
    properties: properties || {},
    component: component,
    element: element,
    path: path
  });
};
