
/**
 * Dependencies
 */

var Rendered = require('./rendered');
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

function Mount(container, Component, props) {
  this.id = (++i).toString(36);
  this.container = container;
  this.type = Component;
  this.component = new Rendered(Component, props);
  this.el = this.component.toElement();

  // Add it to the DOM
  this.component.lifecycle('beforeMount');
  container.appendChild(this.el);
  this.component.lifecycle('mount', [this.el]);
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
