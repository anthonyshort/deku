
/**
 * Dependencies
 */

var ComponentRenderer = require('./component');

/**
 * Expose `Mount`.
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
 * TODO: could we use promises instead of callbacks?
 *
 * @param {Object} newProps
 */

Mount.prototype.setProps = function(newProps, done){
  this.rendered.setProps(newProps, done);
};

/**
 * Update the component by re-rendering it and
 * diffing it with the previous version
 */

Mount.prototype.forceUpdate = function(){
  this.rendered.forceUpdate();
};

/**
 * Remove the component from the DOM.
 */

Mount.prototype.remove = function(){
  this.rendered.remove();
};
