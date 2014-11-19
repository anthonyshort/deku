
/**
 * Dependencies
 */

var ComponentRenderer = require('./component');

/**
 * Expose `Mount`.
 *
 * TODO: lets not directly expose the Mount and just return
 * and object with a minimal API.
 */

module.exports = Mount;

/**
 * Manages a Component that is mounted to an element.
 * Mounting the same component type.
 *
 * This is sort of equivalent to a "Scene" in graphics programming.
 *
 * @param {Component} Component
 * @param {Object} props
 */

function Mount(Component, props) {
  this.rendered = new ComponentRenderer(Component, props);
  this.type = Component;
}

/**
 * Add this mount to the DOM.
 *
 * @param {Element} container
 */

Mount.prototype.appendTo = function(container){
  this.rendered.appendTo(container);
};

/**
 * Set new props on the component and trigger a re-render.
 *
 * @param {Object} newProps
 */

Mount.prototype.set = function(newProps){
  // TODO
  // This should schedule to happen on the next frame
  // along with all the other components so they all
  // touch the DOM at the same time to minimize thrashing
  this.rendered.setProps(newProps);
  this.render();
};

/**
 * Update the component by re-rendering it and
 * diffing it with the previous version
 */

Mount.prototype.update =
Mount.prototype.render = function(){
  this.rendered.update();
};

/**
 * Remove the component from the DOM.
 */

Mount.prototype.remove = function(){
  this.rendered.remove();
};

/**
 * Get a child component using the `ComponentNode`.
 *
 * @param {ComponentNode} node
 * @return {Mount}
 */

Mount.prototype.getChildByNode = function(node){
  return this.rendered.getChildByNode(node);
};

/**
 * Get the path of a node within this components tree.
 *
 * @param {Node} node
 * @return {String}
 */

Mount.prototype.path = function(node){
  return this.rendered.path(node);
};

/**
 * Convert this node and all it's children into
 * real DOM elements and return it.
 *
 * Passing in a node allows us to render just a small
 * part of the tree instead of the whole thing, like when
 * a new branch is added during a diff.
 *
 * @param {Node} node
 * @return {Element}
 */

Mount.prototype.toElement = function(node, tree){
  return this.rendered.toElement(node, tree);
};
