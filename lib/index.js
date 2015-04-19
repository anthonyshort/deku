
/**
 * Module dependencies.
 */

var stringify = require('./renderer/string');
var Application = require('./application');
var virtual = require('./virtual');

/**
 * Expose `deku`.
 */

exports = module.exports = deku;

/**
 * Expose internals.
 */

exports.renderString = stringify;
exports.scene =
exports.Application =
exports.app = Application;
exports.dom =
exports.virtual = virtual;
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
