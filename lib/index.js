
/**
 * Module dependencies.
 */

var stringify = require('./renderer/string');
var Application = require('./application');
var component = require('./component');
var virtual = require('./virtual');
var Value = require('./value');

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
exports.dom =
exports.virtual = virtual;
exports.deku = deku;
exports.value =
exports.Value = Value;

/**
 * Initialize a new `Application`.
 *
 * This is just syntax sugar.
 */

function deku() {
  var application = Application();
  return application;
}
