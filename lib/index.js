/**
 * Create the application.
 */

exports.tree =
exports.scene =
exports.deku = require('./application')

/**
 * Render scenes to the DOM.
 */

if (typeof document !== 'undefined') {
  exports.render = require('./renderers/client')
}

/**
 * Render scenes to a string
 */

exports.renderString = require('./renderers/server')