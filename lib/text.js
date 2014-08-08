
/**
 * Create a new virtual textn ode
 *
 * @param {String} contents
 */

function TextNode(contents) {
  this.contents = String(contents);
}

/**
 * Return the node as a string
 */

TextNode.prototype.toString = function() {
  return this.contents;
};

/**
 * Transform this node into a DOM element
 */

TextNode.prototype.toElement = function() {
  return document.createTextNode(this.contents);
};

/**
 * Export
 */

module.exports = TextNode;