module.exports = VirtualText;

/**
 * Represents a text node
 *
 * @param {String} text
 */

function VirtualText(text) {
  this.data = String(text);
  this.type = 'text';
}

/**
 * Convert this virtual element into a real DOM element
 *
 * @return {Element}
 */

VirtualText.prototype.render = function() {
  return document.createTextNode(this.data);
}

/**
 * Convert a virtual element into a HTML string
 *
 * @param {VirtualText} vnode
 *
 * @return {String}
 */

VirtualText.prototype.toString = function() {
  return this.data;
}