
/**
 * Module dependencies.
 */

var stringify = require('./renderer/string');
var component = require('./component');
var dom = require('./virtualize').node;
var World = require('./world');

/**
 * Expose `deku`.
 */

exports = module.exports = deku;

/**
 * Expose internals.
 */

exports.renderString = stringify;
exports.component = component;
exports.scene =
exports.World =
exports.world = World;
exports.dom = dom;

/**
 * Initialize a new `World`.
 *
 * This is just syntax sugar.
 */

function deku(component, layers, properties) {
  var world = World();
  if (typeof window !== 'undefined') {
    var renderer = require('./renderer/dom');
    world.use(renderer(world, Component, layers, properties));
  }
  return world;
}
