module.exports = VirtualElement;

/**
 * Dependencies
 */

var domify = require('component/domify@1.3.1');
var utils = require('./utils');

/**
 * Create a new virtual node
 *
 * @param {String} tagName
 * @param {Object} attributes
 * @param {Array} children
 */

function VirtualElement(tagName, attrs, children) {
  this.tagName = tagName || 'div';
  this.children = children || [];
  this.attributes = attrs || {};
  this.type = 'element';
}

/**
 * Convert this virtual element into a real DOM element
 *
 * @return {Element}
 */

VirtualElement.prototype.render = function() {
  return domify(this.toString());
}

/**
 * Convert a virtual element into a HTML string
 *
 * @param {VirtualElement} vnode
 *
 * @return {String}
 */

VirtualElement.prototype.toString = function() {
  var str = '';
  var props = utils.objectToAttributes(this.attributes);
  str += '<' + this.tagName;
  if (props) str += ' ' + props;
  str += '>';
  str += this.children.map(String).join("\n");
  str += '</' + this.tagName + '>';
  return str;
}
