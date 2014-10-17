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