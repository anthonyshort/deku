
/**
 * Expose `TextNode`.
 */

module.exports = TextNode;

/**
 * Initialize a new `TextNode`.
 *
 * This is just a virtual HTML text object.
 *
 * @param {String} text
 * @api public
 */

function TextNode(text) {
  this.type = 'text';
  this.data = String(text);
}