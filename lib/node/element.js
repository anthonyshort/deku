
/**
 * Expose `ElementNode`.
 */

module.exports = ElementNode;

/**
 * Initialize a new `ElementNode`.
 *
 * @param {String} tagName
 * @param {Object} attributes
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual dom nodes.
 * @api public
 */

function ElementNode(tagName, attributes, key, children) {
  this.type = 'element';
  this.tagName = tagName || 'div';
  this.attributes = attributes;
  if (key) this.attributes['data-key'] = key;
  this.children = children || [];
  this.key = key;
}