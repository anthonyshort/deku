
/**
 * Initialize a new `TextNode`.
 *
 * This is just a virtual HTML text object.
 *
 * @param {String} text
 * @api public
 */

module.exports = function(text) {
  var node = {};
  node.type = 'text';
  node.data = String(text);
  return node;
};