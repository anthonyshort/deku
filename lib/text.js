
/**
 * Expose `VirtualText`.
 */

module.exports = VirtualText;

/**
 * Initialize a new `VirtualText`.
 *
 * This is just a virtual HTML text object.
 *
 * @param {String} text
 * @api public
 */

function VirtualText(text) {
  this.data = String(text);
  this.type = 'text';
}

/**
 * Convert this virtual element into a real DOM element.
 *
 * @return {HTMLElement}
 * @api public
 */

VirtualText.prototype.render = function(){
  return document.createTextNode(this.data);
};

/**
 * Return the text string.
 *
 * @return {String}
 * @api public
 */

VirtualText.prototype.toString = function(){
  return this.data;
};
