
/**
 * Module dependencies.
 */

var VirtualElement = require('./element');
var domify = require('component/domify');
var utils = require('./utils');
var diff = require('./diff');

/**
 * Expose `VirtualNode`.
 */

module.exports = VirtualNode;

/**
 * Represents a node in a virtual tree.
 *
 * It holds a virtual element, component, or text node.
 *
 * @param {String} tagName
 * @param {Function} type
 * @param {Mixed} attributes Can be a string value for text too
 * @param {Array} children
 * @api public
 */

function VirtualNode(tagName, type, attributes, children) {
  this.type = type;
  this.tagName = tagName;
  this.attributes = attributes || {};
  this.parent = null;
  this.children = children || [];
  this.children.map(setParent, this);
  this.create();
}

/**
 * Compute the patch between this node and an updated node.
 *
 * @param {VirtualNode} updated
 * @return {Patch}
 * @api public
 */

VirtualNode.prototype.diff = function(updated){
  return diff(this, updated);
};

/**
 * Convert this virtual owner into a real DOM owner.
 *
 * @return {HTMLElement}
 * @api public
 */

VirtualNode.prototype.render = function(){
  return domify(this.toString());
};

/**
 * Convert a virtual owner into a HTML string.
 *
 * @return {String}
 * @api public
 */

VirtualNode.prototype.toString = function(){
  return this.owner.toString();
};

/**
 * Create the owner for this node.
 *
 * @api public
 */

VirtualNode.prototype.create = function(){
  var Owner = this.type;
  this.owner = new Owner(this);
  return this;
};

/**
 * Is this the root node of the tree?
 *
 * @return {Boolean}
 * @api private
 */

VirtualNode.prototype.isRoot = function(){
  return this.parent === null;
};

/**
 * Is this a text node?
 *
 * @return {Boolean}
 * @api private
 */

VirtualNode.prototype.isText = function(){
  return this.type.nodeType === 'text';
};

/**
 * Is this an owner node?
 *
 * @return {Boolean}
 * @api private
 */

VirtualNode.prototype.isElement = function(){
  return this.type.nodeType === 'element';
};

/**
 * Is this a component node?
 *
 * @return {Boolean}
 * @api private
 */

VirtualNode.prototype.isComponent = function(){
  return this.type.nodeType === 'component';
};

/**
 * Get the index of this node, relative to the parent.
 *
 * @return {Number}
 * @api private
 */

VirtualNode.prototype.index = function(){
  if (this.isRoot()) return 0;
  return this.parent.children.indexOf(this);
};

/**
 * Get the traceable path for this node.
 *
 * @return {String}
 * @api private
 */

VirtualNode.prototype.path = function(){
  var path = [];
  var node = this;
  while (node.parent) {
    path.unshift(node.index());
    node = node.parent;
  }
  return path.join('.');
};

/**
 * Set the parent of a node.
 *
 * @param {VirtualNode} child
 * @api private
 */

function setParent(child){
  child.parent = this;
}
