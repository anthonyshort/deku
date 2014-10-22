
/**
 * Expose `VirtualElement`.
 */

module.exports = VirtualElement;

/**
 * Module dependencies.
 */

var domify = require('component/domify@1.3.1');
var utils = require('./utils');

/**
 * Initialize a new `VirtualElement`.
 *
 * @param {Node} node
 * @api public
 */

function VirtualElement(node) {
  this.owner = node;
  this.type = 'element';
  this.tagName = node.tagName;
  this.attributes = node.attributes;
}

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
  str += this.node.children.map(String).join("\n");
  str += '</' + this.tagName + '>';
  return str;
};
