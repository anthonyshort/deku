
/**
 * Module dependencies.
 */

var frame = require('anthonyshort/raf-queue');
var renderer = require('../renderer');
var merge = require('yields/merge');

/**
 * Render children initially.
 *
 * @param {String} root Mounted component root.
 * @param {String} path Path from root to this element.
 * @api public
 */

exports.create = function(root, path){
  this.root = root;
  this.path = path;
  this.lifecycle = 'create';
  this.emit('create');
  this.node = this.render(this.state, this.props);
  // TODO: this is necessary to wire up the tree, but it seems a bit weird.
  // This is happening also in `new Node`, children.map(setParent).

  this.enqueue(this.created);
}

/**
 * Update attributes.
 *
 * @api public
 */

exports.update = function(){
  var lifecycle = this.lifecycle;
  // if you call `this.set(x, y)` during create, will immediately take effect.
  if ('create' == lifecycle) return;
  if ('update' == lifecycle) return;
  // ignore if the item is removed and you previously updated it for some reason.
  if ('remove' == lifecycle) return;
  if ('removed' == lifecycle) return;
  this.lifecycle = 'update';
  // TODO: would be nice to remove all of this lifecycle/event junk if possible.
  this.emit('update');
  this.node = this.render(this.state, this.props);
  this.enqueue(this.updated);
}

/**
 * Recursively unmount components.
 *
 * @api public
 */

exports.remove = function(){
  this.lifecycle = 'remove';
  this.emit('remove');
  this.node.remove();
  this.node = null;
  this.root = null;
  this.path = null;
  this.lifecycle = 'removed';
}

/**
 * Set properties on `this.state`.
 *
 * @param {Object} state State to merge with existing state.
 * @api public
 */

exports.set = function(state){
  if (2 == arguments.length) {
    this.state[arguments[0]] = arguments[1];
  } else {
    merge(this.state, state);
  }
  this.invalidate();
}

/**
 * Enqueue updates on the next frame.
 *
 * @param {Function} fn
 * @api public
 */

exports.enqueue = function(fn){
  frame.once(fn);
}

/**
 * Run `update` on the next frame.
 *
 * @api private
 */

exports.invalidate = function(){
  // changes take effect immediately if happening during create.
  if ('create' == this.lifecycle) return;
  renderer.add(this);
}

/**
 * Emit `created` on the next frame.
 *
 * @api private
 */

exports.created = function(){
  this.lifecycle = 'created';
  this.emit('created');
}

/**
 * Emit `updated` on the next frame.
 *
 * @api private
 */

exports.updated = function(){
  this.lifecycle = 'updated';
  this.emit('updated');
}

/**
 * Convert to HTML
 *
 * @return {String}
 * @api public
 */

exports.toString = function(){
  return this.node.toString();
}

/**
 * Get the initial state of the component. Components
 * can override this method
 *
 * @return {Object}
 */

exports.getInitialState = function() {
  return {};
}
