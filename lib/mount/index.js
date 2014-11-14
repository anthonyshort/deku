
/**
 * Dependencies
 */

var Rendered = require('./rendered');
var merge = require('yields/merge');
var diff = require('./diff');

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
  this.component = new Rendered(Component, props);

  // Add the sub-components
  var children = {};
  this.component.walk(function(path, node){
    if (node.type === 'component') {
      children[path] = new Mount(node.component, node.props);
    }
  });

  this.children = children;
}

/**
 * Add this mount to the DOM
 *
 * @param {Element} container
 * @return {Element} The rendered element
 */

Mount.prototype.renderTo = function(container) {
  this._beforeMount();
  this.createElement();
  container.appendChild(this.el);
  this._mount();
}

/**
 * Render the component to a DOM element
 */

Mount.prototype.createElement = function() {
  this.el = this.toElement();
  return this.el;
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
  this.component.lifecycle('mount', [this.el]);
  this.each(function(mount){
    mount._mount();
  });
}

/**
 * Trigger `beforeMount` event on this component and all sub-components
 */

Mount.prototype._beforeMount = function() {
  this.component.lifecycle('beforeMount');
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
  this.component.setProps(newProps);
  this.render();
}

/**
 * Update the component by re-rendering it and
 * diffing it with the previous version
 */

Mount.prototype.render = function(){
  var next = this.component.update();

  // Nothing to render
  if (!next) return;

  // update the element to match
  diff(this, next);

  // Set the new current tree
  // TODO do we need to rebuild the tree every time?
  this.component.setCurrent(next);

  // post-update
  this.component.lifecycle('update', [this.component.props, this.component.state]);
}

/**
 * Remove the component from the DOM
 */

Mount.prototype.remove = function(){
  if (!this.el) return;
  this.component.lifecycle('beforeUnmount', [this.el]);
  if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  this.each(function(child){
    child.remove();
  });
  this.component.lifecycle('unmount');
  this.el = null;
}

/**
 * Remove all components within a node
 *
 * @param {ElementNode} node
 */

Mount.prototype.removeComponents = function(node) {
  var self = this;
  if (!node.children) return;
  node.children.forEach(function(child){
    if (child.type === 'text') return;
    if (child.type === 'element') return self.removeComponents(child);
    var mount = self.getChildByNode(child);
    mount.remove();
  });
}

/**
 * Get a child component using the ComponentNode
 *
 * @param {ComponentNode} node
 *
 * @return {Mount}
 */

Mount.prototype.getChildByNode = function(node){
  var path = this.component.path(node);
  var child = this.children[path];
  return child;
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

Mount.prototype.toElement = function(node){
  node = node || this.component.current;

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
      el.appendChild(this.toElement(children[i]));
    }
    return el;
  }

  // It's a component so lets find the Mount for
  // for that node, render it to an element
  var el = this.getChildByNode(node).createElement();

  // Return el for components that have a
  // root node that's another component
  return el;
}