module.exports = Node;

/**
 * A wrapper for a node in a tree. A node could
 * represent a virtual node or a real DOM node. We
 * abstract it out so we can use the trees in the same way.
 */

function Node(model) {
  this.model = model;
  this.children = [];
}

/**
 * Is this the root node of the tree?
 *
 * @return {Boolean}
 */

Node.prototype.isRoot = function() {
  return this.parent === undefined;
}

/**
 * Does this node have children?
 *
 * @return {Boolean}
 */

Node.prototype.hasChildren = function () {
  return this.children.length > 0;
}

/**
 * Get the traceable path for this node
 *
 * @return {Array}
 */

Node.prototype.path = function () {
  var path = [];
  var node = this;
  while (node.parent) {
    path.unshift(node);
    node = node.parent;
  }
  return path;
}

/**
 * Get the index of this node in relation
 * to it's siblings
 *
 * @return {Number}
 */

Node.prototype.index = function() {
  if (this.isRoot()) return 0;
  return this.parent.children.indexOf(this);
}

/**
 * Find a node in the tree using it's unique ID
 *
 * @param {[type]} id
 *
 * @return {[type]}
 */

Node.prototype.find = function(id) {
  var matched;
  this.walk(function(node){
    if (node.id() === id) {
      matched = node;
      return false;
    }
  });
  return matched;
}

/**
 * Walk down the node and it's children firing the callback
 * on each node it finds. Returning false from this callback
 * will stop the iteration.
 *
 * @param {Function} callback
 *
 * @return {Boolean}
 */

Node.prototype.walk = function(callback) {
  var index = 0;
  var running = callback(this);
  while (index < this.children.length && running) {
    running = callback(this.children[index]);
    if (running) running = this.children[index].walk(callback);
  }
  return running;
}

/**
 * Add a child to this node
 */

Node.prototype.add = function(node, index) {
  node.parent = this;
  if (index != null) {
    this.children.splice(index, 0, node);
  }
  else {
    this.children.push(node);
  }
}