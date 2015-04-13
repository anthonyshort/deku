/**
 * Expose `deku`.
 */

exports = module.exports = require('./deku');

/**
 * DOM Rendering
 */

if (typeof HTMLElement !== 'undefined') {
  exports.render = require('./render');
}

/**
 * Render virtual nodes
 */

exports.dom = exports.virtual = virtual;