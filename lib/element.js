module.exports = VirtualElement;

/**
 * Dependencies
 */

var domify = require('component/domify@1.3.1');
var utils = require('./utils');
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
  this.children = [];
  (children || []).map(this.addChild, this);
}

/**
 * Is this the root node of the tree?
 *
 * @return {Boolean}
 */

VirtualElement.prototype.isRoot = function() {
  return this.parent === undefined;
}

/**
 * Get the traceable path for this node
 *
 * @return {Array}
 */

VirtualElement.prototype.path = function () {
  var path = [];
  var node = this;
  while (node.parent) {
    path.unshift(node.index());
    node = node.parent;
  }
  return path.join('.');
}

/**
 * Get the index of this node in relation
 * to it's siblings
 *
 * @return {Number}
 */

VirtualElement.prototype.index = function() {
  if (this.isRoot()) return 0;
  return this.parent.children.indexOf(this);
}

/**
 * Add a child to this node
 */

VirtualElement.prototype.addChild = function(node, index) {
  node.parent = this;
  if (index != null) {
    this.children.splice(index, 0, node);
  }
  else {
    this.children.push(node);
  }
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
  str += this.children.map(String).join("\n");
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