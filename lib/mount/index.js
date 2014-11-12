
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
 * Store the containers so that when mounting on the
 * same element with the same component it returns
 * the same Mount object each time.
 *
 * Uses a WeakMap so the references in
 *
 * @type {WeakMap}
 */

var _cache = new WeakMap();

/**
 * Manages a Component that is mounted to an element.
 * Mounting the same component type
 *
 * @param {Element} container
 * @param {Component} Component
 * @param {Object} props
 */

function Mount(container, Component, props) {
  var existing = cache(container, Component);

  // Update the props and return the instance
  if (existing) {
    // TODO existing.updateProps(props);
    return existing;
  }

  this.id = (++i).toString(36);
  this.container = container;
  this.type = Component;
  this.component = new Rendered(Component, props);
  this.el = this.component.toElement();

  // Add it to the DOM
  this.component.lifecycle('beforeMount');
  container.appendChild(this.el);
  this.component.lifecycle('mount', this.el);

  // Store it in the cache
  _cache.set(container, this);
}

/**
 * Remove the component from the DOM
 */

Mount.prototype.remove = function(){
  if (!this.el) return;
  this.component.lifecycle('beforeUnmount', this.el);
  this.container.removeChild(this.el);
  this.component.remove();
  this.component.lifecycle('unmount');
  this.el = null;
}

/**
 * Check the cache for existing Mount instance
 *
 * @param {Element} container
 * @param {Function} Component
 *
 * @return {Mount}
 */

function cache(container, Component) {
  var existing = _cache.get(container);
  if (existing) {
    // Same type so return the instance
    if (existing.type === Component) {
      return existing;
    } else {
      // Different type so remove the old reference
      existing.remove();
      _cache.delete(container);
    }
  }
  return false;
}