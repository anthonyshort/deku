/**
 * Create the application.
 */

exports.deku =
exports.App = require('./application');

/**
 * Render scenes to the DOM.
 */

if (typeof document !== 'undefined') {
  exports.render = require('./render');
}

/**
 * Render scenes to a string
 */

exports.renderString = require('./stringify');

/**
 * Create virtual elements.
 */

exports.element =
exports.dom = require('./virtual');