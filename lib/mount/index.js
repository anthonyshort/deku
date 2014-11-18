
/**
 * Dependencies
 */

var Rendered = require('./rendered');
var merge = require('yields/merge');
var diff = require('./diff');
var Tree = require('./tree');

/**
 * Exports
 * TODO: lets not directly expose the Mount and just return
 * and object with a minimal API.
 */

module.exports = Mount;

/**
 * Manages a Component that is mounted to an element.
 * Mounting the same component type
 *
 * @param {Element} container
 * @param {Component} Component
 * @param {Object} props
 */

function Mount(Component, props) {
  this.type = Component;
  this.rendered = new Rendered(Component, props);
  this.children = {};

  // When component state changes
  this.rendered.instance.on('change', this.render.bind(this));

  // Create the element
  // TODO we could potentially pass in a pre-rendered element and
  // use that instead of creating a new one.
  this.el = this.toElement(this.rendered.current, this.rendered.tree);

  // TODO: This should know the current lifecycle state of the c
  // component so that we can do things like preventing updates
  // while unmounting
}

/**
 * Add this mount to the DOM
 *
 * @param {Element} container
 * @return {Element} The rendered element
 */

Mount.prototype.appendTo = function(container) {
  this._beforeMount();
  container.appendChild(this.el);
  this._mount();
}

/**
 * Call a method on each sub-component
 *
 * @param {Function} fn
 */

Mount.prototype.each = function(fn) {
  for (var path in this.children) fn(this.children[path]);
}

/**
 * Trigger `mount` event on this component and all sub-components
 */

Mount.prototype._mount = function() {
  this.rendered.lifecycle('mount', [this.el]);
  this.each(function(mount){
    mount._mount();
  });
}

/**
 * Trigger `beforeMount` event on this component and all sub-components
 */

Mount.prototype._beforeMount = function() {
  this.rendered.lifecycle('beforeMount');
  this.each(function(mount){
    mount._beforeMount();
  });
}

/**
 * Set new props on the component and trigger a re-render
 *
 * @param {Object} newProps
 */

Mount.prototype.set = function(newProps) {
  // TODO
  // This should schedule to happen on the next frame
  // along with all the other components so they all
  // touch the DOM at the same time to minimize thrashing
  this.rendered.setProps(newProps);
  this.render();
}

/**
 * Update the component by re-rendering it and
 * diffing it with the previous version
 */

Mount.prototype.render = function(){
  var next = this.rendered.update();

  // Nothing to render
  if (!next) return;

  // Transform the tree into paths
  var nextTree = new Tree(next);

  // update the element to match
  diff(this, nextTree);

  // Set the new current tree
  // TODO do we need to rebuild the tree every time?
  this.rendered.setCurrent(next, nextTree);

  // post-update
  this.rendered.lifecycle('update', [this.rendered.props, this.rendered.state]);
}

/**
 * Remove the component from the DOM
 */

Mount.prototype.remove = function(){
  if (!this.el) return;
  this.rendered.lifecycle('beforeUnmount', [this.el]);
  if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  this.each(function(child){
    child.remove();
  });
  this.rendered.lifecycle('unmount');
  this.el = null;
  this.children = {};
}

/**
 * Remove all components within a node
 *
 * @param {Node} node
 */

Mount.prototype.removeComponents = function(node) {
  var self = this;

  // text nodes can't have children
  if (node.type === 'text') return;

  // remove a child component
  if (node.type === 'component') {
    var path = this.getPath(node);
    self.children[path].remove();
    delete self.children[path];
  }

  // recursively remove components
  if (node.children) {
    node.children.forEach(function(child){
      self.removeComponents(child);
    });
  }
}

/**
 * Get a child component using the ComponentNode
 *
 * @param {ComponentNode} node
 *
 * @return {Mount}
 */

Mount.prototype.getChildByNode = function(node) {
  var path = this.getPath(node);
  var child = this.children[path];
  return child;
}

/**
 * Get the path of a node within this components tree
 *
 * @param {Node} node
 *
 * @return {String}
 */

Mount.prototype.getPath = function(node) {
  return this.rendered.path(node);
}

/**
 * Convert this node and all it's children into
 * real DOM elements and return it.
 *
 * Passing in a node allows us to render just a small
 * part of the tree instead of the whole thing, like when
 * a new branch is added during a diff.
 *
 * @param {Node} node
 *
 * @return {Element}
 */

Mount.prototype.toElement = function(node, tree){

  // TODO: When creating elements from the next version of the
  // tree we need to use that tree to get the paths, not the current
  // tree, but we need to use the current mount to store the components
  // on. Could we just set the next tree to be the current tree before doing the
  // diff?

  // This component renders nothing
  // TODO: probably don't allow this to happen
  if (!node) {
    return document.createElement('noscript');
  }

  if (node.type === 'text') {
    return document.createTextNode(node.data);
  }

  if (node.type === 'element') {
    var el = document.createElement(node.tagName);
    var children = node.children;
    // Attributes
    for (var name in node.attributes) {
      el.setAttribute(name, node.attributes[name]);
    }
    // Children
    for (var i = 0, n = children.length; i < n; i++) {
      el.appendChild(this.toElement(children[i], tree));
    }
    return el;
  }

  var path = tree.path(node);
  var mount = this.children[path] = new Mount(node.component, node.props);

  // Return el for components that have a
  // root node that's another component
  return mount.el;
}