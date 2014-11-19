
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
 * @param {String} path
 */

function Tree(node, path) {
  this.root = node;
  this.nodes = parse(node, path);
}

/**
 * Get a node from the tree using it's path.
 *
 * @param {String|Array} path
 * @return {Node}
 */

Tree.prototype.get = function(path){
  return this.nodes[path];
};

/**
 * Walk the tree and call the function on each node.
 *
 * @param {Function} fn
 */

Tree.prototype.walk = function(fn){
  for (var key in this.nodes) {
    fn(key, this.nodes[key]);
  }
};

/**
 * Get the path for a node.
 *
 * @param {Node} node
 * @return {String}
 */

Tree.prototype.path = function(node){
  var match;
  this.walk(function(path, child){
    if (child === node) match = path;
  });
  return match;
};

/**
 * Parse a Node into a hash table.
 *
 *  {
 *    '0': ElementNode,
 *    '0.1': ElementNode,
 *    '0.1.1': TextNode,
 *    '0.2': ElementNode
 *    '0.3': ComponentNode
 *  }
 *
 * @param {Node} node
 * @param {String} path
 * @param {Object} nodes
 * @return {Object}
 */

function parse(node, path, nodes) {
  path = path || '0';
  nodes = nodes || {};
  nodes[path] = node;
  if (node.children) {
    node.children.forEach(function(node, index){
      parse(node, path + '.' + (node.key || index), nodes);
    });
  }
  return nodes;
}
