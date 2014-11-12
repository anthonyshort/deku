
/**
 * Module dependencies.
 */

var frame = require('anthonyshort/raf-queue');
var diff = require('./diff');

/**
 * Initialize a new `SceneRenderer`.
 *
 * The renderer is a singleton object that handles rendering
 * components when they have changed. It batches these changes
 * and executes them on the next frame.
 */

function SceneRenderer() {
  if (!(this instanceof SceneRenderer)) return new SceneRenderer;
  // collection of component renderers to update.
  this.dirty = [];
}

/**
 * Add a component to the render queue.
 *
 * @param {ComponentRenderer} component
 * @param {Object} state State it will update to.
 */

Scene.prototype.add = function(component){
  var dirty = this.dirty;
  if (dirty.indexOf(component) > -1) return;
  dirty.push(component);
  frame.once(this.render);
};

/**
 * Render the dirty queue.
 *
 * This should typically happen on the next frame.
 *
 * @api public
 */

Scene.prototype.render = function(){
  var dirty = this.dirty;
  while (dirty.length) {
    dirty.pop().update();
  }
};

/**
 * Mount.
 *
 * @param {Object} props
 * @param {Array} children
 * @api public
 */

Scene.prototype.mount = function(Component, container, props) {
  var component = new Component(props);
  var rendered = new RenderedComponent(component);
  rendered.mount(container);
  return rendered;
};

/**
 * Mount this tree to a container node. It will treat the
 * first child of this container as the node to diff to
 * current tree to.
 *
 * @param {Element} container
 */

function mount(tree, el) {
  if (tree.el) tree.unmount();
  tree.el = el;
  var virtual = createVirtualFromDOM(el);
  tree.diff(virtual).apply(el);
}
