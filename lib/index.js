
/**
 * Module dependencies.
 */

var stringify = require('./renderer/string');
var component = require('./component');
var dom = require('./virtualize').node;
var Application = require('./application');

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
exports.Application =
exports.app = Application;
exports.dom = dom;
exports.deku = deku;

/**
 * Initialize a new `Application`.
 *
 * This is just syntax sugar.
 */

function deku() {
  var application = Application();
  return application;
}
