
/**
 * Export `Tree`.
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
  this.paths = {};
  this.nodes = {};
  this.parse(node, path);
}

/**
 * Get the path for a node.
 *
 * @param {Node} node
 * @return {String}
 */

Tree.prototype.getPath = function(node){
  return this.paths[node.id];
};

/**
 * Get the node at a path
 *
 * @param {String} path
 *
 * @return {Node}
 */

Tree.prototype.getNode = function(path){
  return this.nodes[path];
};

/**
 * Parse a Node into a hash table using the ID
 * of the node that is unique.
 *
 *  {
 *    '1': ElementNode,
 *    '2': ElementNode,
 *    '3': TextNode,
 *  }
 *
 * @param {Node} node
 * @param {String} path
 * @return {Object}
 */

Tree.prototype.parse = function(node, path){
  path = path || '0';
  this.paths[node.id] = path;
  this.nodes[path] = node;
  if (node.children) {
    node.children.forEach(function(node, index){
      this.parse(node, path + '.' + (node.key || index));
    }, this);
  }
};
