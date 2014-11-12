
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
}

/**
 * Add this mount to the DOM
 *
 * @param {Element} container
 * @return {Element} The rendered element
 */

Mount.prototype.renderTo = function(container) {
  this.component.lifecycle('beforeMount');
  this.el = this.component.toElement();
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
}

/**
 * Remove the component from the DOM
 */

Mount.prototype.remove = function(){
  if (!this.el) return;
  this.component.lifecycle('beforeUnmount', [this.el]);
  this.container.removeChild(this.el);
  this.component.remove();
  this.component.lifecycle('unmount');
  this.el = null;
}
