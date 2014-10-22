
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
 * @param {String} tagName
 * @param {Object} attributes
 * @api public
 */

function VirtualElement(tagName, attributes) {
  this.tagName = tagName || 'div';
  this.attributes = attributes || {};
  this.type = 'element';
  this.node = null;
}

/**
 * Convert this virtual element into a real DOM element
 *
 * @return {HTMLElement}
 * @api public
 */

VirtualElement.prototype.render = function(){
  return domify(this.toString());
};

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
