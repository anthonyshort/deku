module.exports = VirtualNode;

/**
 * Dependecies
 */

var utils = require('./utils');
var diff = require('./diff');

/**
 * Represents a node in a virtual tree. It holds a
 * virtual element or text node.
 *
 * @param {VirtualElement|VirtualText} element
 */

function VirtualNode(element) {
  this.index = 0;
  this.parent = null;
  this.element = element;

  if (this.isElement()) {
    element.children.map(function(child, i){
      child.parent = this;
      child.index = i;
    }, this);
  }
}

/**
 * Is this the root node of the tree?
 *
 * @return {Boolean}
 */

VirtualNode.prototype.isRoot = function() {
  return this.parent === undefined;
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
 * Get the traceable path for this node
 *
 * @return {Array}
 */

VirtualNode.prototype.path = function () {
  var path = [];
  var node = this;
  while (node.parent) {
    path.unshift(node.index);
    node = node.parent;
  }
  return path.join('.');
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