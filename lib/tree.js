
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
 * @param {String} name
 * @param {Node} node
 */

function Tree(name, node) {
  this.name = name;
  this.root = node;
  this.nodes = parseTree(node);
  this.id = createId(this);
  this.sha = createSha(this);
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

function parseTree(node, path, nodes) {
  path = path || '0';
  nodes = nodes || {};
  nodes[path] = node;
  node.children.forEach(function(node, index){
    parseTree(node, path + '.' + (node.key || index), nodes);
  });
  return nodes;
}

/**
 * Create an ID for the tree
 *
 * @param {Tree} tree
 *
 * @return {String}
 */

function createId(tree) {
  var id = tree.name + '=';
  tree.walk(function(path, node){
    id += path + '[' + node.type + ']'
  });
  return id;
}

/**
 * Create a sha for a tree. The sha can be used
 * to compare a tree with another tree. This makes
 * it easy to tell if the structure of two trees
 * is the same. We can use this to optimize diffing
 *
 * @param {Tree} tree
 *
 * @return {String}
 */

function createSha(tree) {
  return sha(tree.id);
}
