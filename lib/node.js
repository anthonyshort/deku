
/**
 * Module dependencies.
 */

var TextComponent = require('./component/text');
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
 * @param {Function} factory
 * @param {Object|String} attributes Either `ElementComponent` attributes,
 *   or `TextComponent` value. If it's a `TextComponent` value, then
 *   we can optimize and don't have to actually create the `TextComponent`.
 * @param {Array} children
 * @api public
 */

function VirtualNode(tagName, factory, attributes, children) {
  children = (children || []).map(normalize);
  this.parent = null;
  this.factory = factory;
  this.tagName = tagName;
  this.type = factory.nodeType;
  this.attributes = attributes || {};
  this.children = children;
  this.children.map(setParent, this);

  // TODO: this should be lazy, can't get it to work yet tho
  var ComponentFactory = this.factory;
  this.instance = new ComponentFactory(this);
  return this;
}

/**
 * Initialize the node tree and all subcomponents.
 *
 * @param {String} root
 * @param {String} path
 * @api public
 */

VirtualNode.prototype.create = function(root, path){
  this.instance.create(root, path);
};

/**
 * Convert this virtual instance into a real DOM instance.
 *
 * @return {HTMLElement}
 * @api public
 */

VirtualNode.prototype.render = function(){
  return domify(this.toString());
};

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
 * Is this the root node of the tree?
 *
 * @return {Boolean}
 * @api public
 */

VirtualNode.prototype.isRoot = function(){
  return this.parent === null;
};

/**
 * Is this a text node?
 *
 * @return {Boolean}
 * @api public
 */

VirtualNode.prototype.isText = function(){
  return this.type === 'text';
};

/**
 * Is this an instance node?
 *
 * @return {Boolean}
 * @api public
 */

VirtualNode.prototype.isElement = function(){
  return this.type === 'element';
};

/**
 * Is this a component node?
 *
 * @return {Boolean}
 * @api public
 */

VirtualNode.prototype.isComponent = function(){
  return this.type === 'component';
};

/**
 * Get the index of this node, relative to the parent.
 *
 * @return {Number}
 * @api public
 */

VirtualNode.prototype.index = function(){
  if (this.isRoot()) return 0;
  return this.parent.children.indexOf(this);
};

/**
 * Get the traceable path for this node.
 *
 * @return {String}
 * @api public
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
 * Convert a virtual instance into a HTML string.
 *
 * @return {String}
 * @api public
 */

VirtualNode.prototype.toString = function(){
  return this.instance.toString();
};

/**
 * Set the parent of a node.
 *
 * @param {VirtualNode} child
 * @api private
 */

function setParent(child) {
  child.parent = this;
}

/**
 * Parse nodes into real VirtualNodes.
 *
 * @param {Mixed} value
 * @return {VirtualNode}
 * @api private
 */

function normalize(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return new VirtualNode('text', TextComponent, value);
  }
  return value;
}
