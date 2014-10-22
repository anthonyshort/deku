
/**
 * Module dependencies.
 */

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
 * @param {VirtualElement|VirtualText|Component} owner
 * @param {Array} children
 * @api public
 */

function VirtualNode(owner, children) {
  this.parent = null;
  this.owner = owner;
  this.owner.node = this;
  this.children = children || [];
  this.children.map(setParent, this);
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
  return this.owner.render();
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
  return this.owner.type === 'text';
};

/**
 * Is this an owner node?
 *
 * @return {Boolean}
 * @api private
 */

VirtualNode.prototype.isElement = function(){
  return this.owner.type === 'owner';
};

/**
 * Is this a component node?
 *
 * @return {Boolean}
 * @api private
 */

VirtualNode.prototype.isComponent = function(){
  return this.owner.type === 'component';
};

/**
 * Does this node have child nodes?
 *
 * @return {Boolean}
 * @api private
 */

VirtualNode.prototype.hasChildren = function(){
  return this.owner.children && this.owner.children.length;
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
 * Convert a virtual owner into a HTML string.
 *
 * @return {String}
 * @api public
 */

VirtualNode.prototype.toString = function(){
  return this.owner.toString();
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
