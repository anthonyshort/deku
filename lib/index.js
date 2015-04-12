
/**
 * Module dependencies.
 */

var renderString = require('./renderer/string');
var render = require('./renderer/string');
var component = require('./component');
var virtual = require('./virtual');
var App = require('./application');
var Value = require('./value');

/**
 * Expose `deku`.
 */

exports = module.exports = deku;

/**
 * Expose internals.
 */

exports.renderString = renderString;
exports.render = render;
exports.component = component;
exports.App = App;
exports.dom = exports.virtual = virtual;
exports.value = exports.Value = Value;