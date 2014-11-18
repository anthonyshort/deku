
/**
 * Expose `TextNode`.
 */

module.exports = TextNode;

/**
 * Initialize a new `TextNode`.
 *
 * This is just a virtual HTML text object.
 *
 * @param {Node} node
 * @api public
 */

function TextNode(text) {
  this.type = 'text';
  this.data = String(text);
}

/**
 * Return the text string.
 *
 * @return {String}
 * @api public
 */

TextNode.prototype.toString = function(){
  return this.data;
}
