
/**
 * Expose `VirtualText`.
 */

module.exports = VirtualText;

/**
 * Initialize a new `VirtualText`.
 *
 * This is just a virtual HTML text object.
 *
 * @param {Node} node
 * @api public
 */

function VirtualText(node) {
  this.owner = node;
  // TODO: this is kinda weird, need to figure out a better way.
  this.data = String(node.attributes);
  this.type = 'text';
}

/**
 * Return the text string.
 *
 * @return {String}
 * @api public
 */

VirtualText.prototype.toString = function(){
  return this.data;
};
