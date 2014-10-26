
/**
 * Module dependencies.
 */

var domify = require('component/domify');
var diff = require('./diff');

/**
 * Expose `Node`.
 */

module.exports = Node;

/**
 * Represents a node in a virtual tree.
 *
 * It holds a virtual element, component, or text node.
 *
 * @param {String} type
 * @param {Function} factory
 * @param {Array} children
 * @param {Object} data
 * @api public
 */

function Node(type, factory, children, data) {
  this.index = 0;
  this.type = type;
  this.parent = null;
  this.key = data.key;
  this.factory = factory;
  this.data = data || {};
  this.children = children || [];
  this.children.map(setParent, this);
}

/**
 * Convert this virtual instance into a real DOM instance.
 *
 * @return {HTMLElement}
 * @api public
 */

Node.prototype.render = function(){
  return domify(this.toString());
}

/**
 * Initialize the node tree and all subcomponents.
 *
 * @param {String} root
 * @param {String} path
 * @return {Component|ElementComponent|TextComponent} instance
 * @api public
 */

Node.prototype.create = function(root, path){
  if (this.instance) return this.instance;
  var Component = this.factory;
  this.instance = new Component(this);
  this.instance.create(root, path || root);
  return this.instance;
}

/**
 * TODO: Recursively remove all nodes and components from this point.
 *
 * @api public
 */

Node.prototype.remove = function(){
  if (!this.instance) return;
  if (this.instance.remove) this.instance.remove();
  this.instance = null;
}

/**
 * Compute the patch between this node and an updated node.
 *
 * @param {Node} updated
 * @return {Patch}
 * @api public
 */

Node.prototype.diff = function(updated){
  return diff(this, updated);
}

/**
 * Is this the root node of the tree?
 *
 * @return {Boolean}
 * @api public
 */

Node.prototype.isRoot = function(){
  return this.parent === null;
}

/**
 * Is this a text node?
 *
 * @return {Boolean}
 * @api public
 */

Node.prototype.isText = function(){
  return this.type === 'text';
}

/**
 * Is this an instance node?
 *
 * @return {Boolean}
 * @api public
 */

Node.prototype.isElement = function(){
  return this.type === 'element';
}

/**
 * Is this a component node?
 *
 * @return {Boolean}
 * @api public
 */

Node.prototype.isComponent = function(){
  return this.type === 'component';
}

/**
 * Get the traceable path for this node.
 *
 * @return {String}
 * @api public
 */

Node.prototype.path = function(){
  var path = [];
  var node = this;
  while (node.parent) {
    path.unshift(node.index);
    node = node.parent;
  }
  return path.join('.');
}

/**
 * Convert a virtual instance into a HTML string.
 *
 * @return {String}
 * @api public
 */

Node.prototype.toString = function(){
  return this.create().toString();
}

/**
 * Set the parent of a node.
 *
 * @param {Node} child
 * @api private
 */

function setParent(child) {
  child.parent = this;
}