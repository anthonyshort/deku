module.exports = VirtualNode;

/**
 * Dependecies
 */

var domify = require('component/domify@1.3.1');
var VirtualText = require('./text');
var utils = require('./utils');
var diff = require('./diff');

/**
 * Represents a node in a virtual tree. It holds a
 * virtual element or text node.
 *
 * @param {VirtualElement|VirtualText} element
 * @param {Array} children
 */

function VirtualNode(element, children) {
  this.parent = null;
  this.element = element;
  this.children = [];
  (children || []).map(this.addChild, this);
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
 * Get the traceable path for this node
 *
 * @return {Array}
 */

VirtualNode.prototype.path = function () {
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

VirtualNode.prototype.index = function() {
  if (this.isRoot()) return 0;
  return this.parent.children.indexOf(this);
}

/**
 * Add a child to this node
 */

VirtualNode.prototype.addChild = function(node, index) {
  if (typeof node === 'string') {
    var element = new VirtualText(node);
    node = new VirtualNode(element);
  }
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

VirtualNode.prototype.toElement = function() {
  if (this.element.type === 'text') {
    return document.createTextNode(this.element.data);
  }
  return domify(this.toString());
}

/**
 * Convert a virtual element into a HTML string
 *
 * @param {VirtualNode} vnode
 *
 * @return {String}
 */

VirtualNode.prototype.toString = function() {
  var element = this.element;
  if (element.type === 'text') {
    return element.data;
  }
  var str = '';
  var props = utils.objectToAttributes(element.attributes);
  str += '<' + element.tagName;
  if (props) str += ' ' + props;
  str += '>';
  str += this.children.map(String).join("\n");
  str += '</' + element.tagName + '>';
  return str;
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