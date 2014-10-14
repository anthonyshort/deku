module.exports = VirtualElement;

/**
 * Dependencies
 */

var domify = require('component/domify@1.3.1');
var utils = require('./utils');
var Node = require('./node');
var diff = require('./diff');
var slice = [].slice;

/**
 * Create a new virtual node
 *
 * @param {String} tagName
 * @param {Object} attributes
 * @param {Array} children
 */

function VirtualElement(tagName, attrs, children) {
  this.tagName = tagName || 'div';
  this.attributes = attrs || {};
  this.node = new Node(this);
  if (children) children.map(this.node.add, this.node);
}

/**
 * Get an attribute from the node
 *
 * @param {String} name
 *
 * @return {String}
 */

VirtualElement.prototype.get = function(name) {
  return this.attributes[name];
}

/**
 * Convert this virtual element into a real DOM element
 *
 * @return {Element}
 */

VirtualElement.prototype.toElement = function() {
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
  // str += this.children.map(String).join("\n");
  str += '</' + this.type + '>';
  return str;
}

/**
 * Compare this VirtualElement to another VirtualElement
 * and return an array of patches that can be apply to
 * a DOM node
 *
 * @return {Array}
 */

VirtualElement.prototype.diff = function(other) {
  return diff(this, other);
}