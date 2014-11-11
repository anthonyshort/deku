var Tree = require('./tree');
var diff = require('./diff');
var i = 0;

/**
 * A rendered component is a Node that has had
 * all of it's components also rendered into sub-trees
 *
 * @param {Component} component
 */

function RenderedComponent(component, el) {
  this.id = (++i).toString(36);
  this.component = component;
  this.current = this.component.render();
  this.el = el;
}

/**
 * Update this node
 *
 * @param {Node} target
 *
 * @return {Path}
 */

RenderedComponent.prototype.update = function() {
  var next = this.component.render();
  var patch = diff(this.current, next);
  patch.apply(this.el);
  this.current = next;
  return true;
}