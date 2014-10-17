module.exports = VirtualElement;

/**
 * Create a new virtual node
 *
 * @param {String} tagName
 * @param {Object} attributes
 * @param {Array} children
 */

function VirtualElement(tagName, attrs) {
  this.tagName = tagName || 'div';
  this.attributes = attrs || {};
  this.type = 'element';
}