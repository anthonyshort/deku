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

Node.prototype.index = function() {
  if (this.isRoot()) return 0;
  return this.parent.children.indexOf(this);
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
  var total = this.children.length;
  var running = callback(this);
  while (index < total && running) {
    running = this.children[index].walk(callback);
  }
  return running;
}

/**
 * Get a node using a path
 *
 * @param {Array} path
 *
 * @return {Node}
 */

Node.prototype.get = function(path) {
  var current = path.slice();
  var node = this;
  while (current.length) {
    var index = current.shift();
    node = node.children[index];
  }
  return node;
}

/**
 * Add a child to this node
 */

Node.prototype.add = function(model, index) {
  var node = new Node(model);
  node.parent = this;
  if (index != null) {
    this.children.splice(index, 0, node);
  }
  else {
    this.children.push(node);
  }
}