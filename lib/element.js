
/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Expose `VirtualElement`.
 */

module.exports = VirtualElement;

/**
 * Initialize a new `VirtualElement`.
 *
 * @param {Node} node
 * @api public
 */

function VirtualElement(node) {
  this.owner = node;
  this.tagName = node.tagName;
  this.attributes = node.attributes;
}

/**
 * Type checking.
 */

VirtualElement.nodeType = 'element';

/**
 * Convert a virtual element into HTML markup.
 *
 * @return {String}
 * @api public
 */

VirtualElement.prototype.toString = function(){
  var str = '';
  var props = utils.objectToAttributes(this.attributes);
  str += '<' + this.tagName;
  if (props) str += ' ' + props;
  str += '>';
  str += this.owner.children.map(String).join("\n");
  str += '</' + this.tagName + '>';
  return str;
};
