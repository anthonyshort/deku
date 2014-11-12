
/**
 * Module dependencies.
 */

var Tree = require('../tree');
var i = 0;

/**
 * A rendered component is a Node that has had
 * all of it's components also rendered into sub-trees
 *
 * @param {Component} component
 * @param {ComponentRenderer} owner
 */

function ComponentRenderer(component, owner) {
  this.id = (++i).toString(36);
  this.root = this.owner ? this.owner.root : this;
  this.component = component;
  this.owner = parent;
  this.tree = new Tree(component.render(), this.id);
  this.components = {};
  this.render();
}

/**
 * Render the tree and it's sub-trees
 *
 * @param {ComponentRenderer} rendered
 */

ComponentRenderer.prototype.render = function(){
  var self = this;
  var top = this.tree.root;
  var components = this.components;

  this.tree.walk(function(path, node){
    if (node.type === 'component') {
      var instance = node.create();
      var rendered = new ComponentRenderer(instance, self);
      components[path] = rendered;
    }
  });
};

/**
 * Diff this tree with another Node
 *
 * @param {Node} target
 *
 * @return {Path}
 */

ComponentRenderer.prototype.diff = function(target){
  var tree = this.tree;

  function walk(node) {
    var path = tree.path(node);
    var matching = target.get(path);
    fn(path, node, matching);
    if (node.children) {
      node.children.forEach(walk);
    }
  }

  walk(this.root);
};
