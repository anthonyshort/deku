
/**
 * Dependencies
 */

var sha = require('apily/sha1').hex;

/**
 * Export `Tree`
 */

module.exports = Tree;

/**
 * A tree is representation of Node that is easier
 * to parse and diff. The tree should be considered
 * immutable and won't change.
 *
 * @param {Node} node
 * @param {String} id Optional identifier
 */

function Tree(node, id) {
  this.id = id;
  this.root = node;
  this.nodes = parse(node);
  this.sha = sha(String(this));
}

/**
 * Get a node from the tree using it's path
 *
 * @param {String|Array} path
 *
 * @return {Node}
 */

Tree.prototype.get = function(path) {
  if (Array.isArray(path)) path = path.join('.');
  var node = this.nodes[path];
  if (!node) throw new Error('Node can\t be found');
  return node;
}

/**
 * Walk the tree and call the function on each node
 *
 * @param {Function} fn
 *
 * @return {void}
 */

Tree.prototype.walk = function(fn) {
  for (var key in this.nodes) {
    fn(key, this.nodes[key]);
  }
}

/**
 * Determine if a tree has the same structure
 * and name as another tree
 *
 * @param {Tree} tree
 *
 * @return {Boolean}
 */

Tree.prototype.equals = function(tree) {
  return this.sha === tree.sha;
}

/**
 * Create an ID for the tree
 *
 * @param {Tree} tree
 *
 * @return {String}
 */

Tree.prototype.toString = function() {
  var id = this.id + '=';
  this.walk(function(path, node){
    id += path + '[' + node.type + ']'
  });
  return id;
}

/**
 * Parse a Node into a hash table
 *
 *  {
 *    '0': ComponentNode,
 *    '0.1': ElementNode,
 *    '0.1.1': TextNode,
 *    '0.2': ElementNode
 *  }
 *
 * @param {Node} node
 * @param {String} path
 * @param {Object} nodes
 *
 * @return {Object}
 */

function parse(node, path, nodes) {
  path = path || '0';
  nodes = nodes || {};
  nodes[path] = node;
  if (node.children) {
    node.children.forEach(function(node, index){
      parseTree(node, path + '.' + (node.key || index), nodes);
    });
  }
  return nodes;
}