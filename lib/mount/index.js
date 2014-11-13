
/**
 * Dependencies
 */

var Rendered = require('./rendered');
var merge = require('yields/merge');
var diff = require('../diff');
var dirty = [];
var i = 0;

/**
 * Exports
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
  this.id = (++i).toString(36);
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
  this.component.lifecycle('beforeMount');
  this.el = this.toElement();
  container.appendChild(this.el);
  this.component.lifecycle('mount', [this.el]);
  this.container = container;
  return this.el;
}

/**
 * Set new props on the component and trigger a re-render
 *
 * @param {Object} newProps
 */

Mount.prototype.set = function(newProps) {
  this.component.setProps(newProps);
  var next = this.component.update();

  // Nothing to render
  if (!next) return;

  // update the element to match
  diff(this, next);

  // Set the new current tree
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
  this.container.removeChild(this.el);
  this.component.remove();
  for (var path in this.children) this.children[path].remove();
  this.component.lifecycle('unmount');
  this.el = null;
}

/**
 * Convert this node and all it's children into
 * real DOM elements and return it.
 *
 * @return {Element}
 */

Mount.prototype.toElement = function(node){
  node = node || this.component.current;

  if (node.type === 'text') {
    return document.createTextNode(node.data);
  }
  else if (node.type === 'element') {
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
  else if (node.type === 'component') {
    // Find the Mount for this path and turn
    // that into a real element
    var path = this.component.path(node);
    var mount = this.children[path];
    return mount.toElement();
  }

  return el;
}