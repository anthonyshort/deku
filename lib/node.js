module.exports = VirtualNode;

/**
 * Dependecies
 */

var utils = require('./utils');
var diff = require('./diff');

/**
 * Set the parent of a node
 *
 * @param {VirtualNode} child
 */

function setParent(child){
  child.parent = this;
}

/**
 * Represents a node in a virtual tree. It holds a
 * virtual element or text node.
 *
 * @param {VirtualElement|VirtualText} element
 * @param {Array} children
 */

function VirtualNode(element, children) {
  var self = this;
  this.parent = null;
  this.element = element;
  this.element.node = this;
  this.children = children || [];
  this.children.map(setParent, this);
}

/**
 * Is this the root node of the tree?
 *
 * @return {Boolean}
 */

VirtualNode.prototype.isRoot = function() {
  return this.parent === null;
}

/**
 * Does this node have child nodes?
 *
 * @return {Boolean}
 */

VirtualNode.prototype.hasChildren = function() {
  return this.element.children && this.element.children.length;
}

/**
 * Is this a text node
 *
 * @return {Boolean}
 */

VirtualNode.prototype.isText = function() {
  return this.element.type === 'text';
}

/**
 * Is this a text node
 *
 * @return {Boolean}
 */

VirtualNode.prototype.isElement = function() {
  return this.element.type === 'element';
}

/**
 * Get the index of this node
 *
 * @return {Number}
 */

VirtualNode.prototype.index = function() {
  if (this.isRoot()) return 0;
  return this.parent.children.indexOf(this);
};

/**
 * Get the traceable path for this node
 *
 * @return {Array}
 */

VirtualNode.prototype.path = function() {
  var path = [];
  var node = this;
  while (node.parent) {
    path.unshift(node.index());
    node = node.parent;
  }
  return path.join('.');
}

/**
 * Compare this VirtualElement to another VirtualElement
 * and return an array of patches that can be apply to
 * a DOM node
 *
 * @param {VirtualNode} updated
 * @return {Array}
 */

VirtualNode.prototype.diff = function(updated) {
  return diff(this, updated);
}

/**
 * Convert this virtual element into a real DOM element
 *
 * @return {Element}
 */

VirtualNode.prototype.render = function() {
  return this.element.render();
}

/**
 * Convert a virtual element into a HTML string
 *
 * @return {String}
 */

VirtualNode.prototype.toString = function() {
  return this.element.toString();
}
