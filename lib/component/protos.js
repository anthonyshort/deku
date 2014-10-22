
/**
 * Module dependencies.
 */

var frame = require('anthonyshort/raf-queue');
var renderer = require('../renderer');
var merge = require('yields/merge');

/**
 * Render.
 *
 * @param {Object} state Just convenience for this.state
 * @param {Object} props Just convenience for this.props
 * @return {Node}
 * @api public
 */

exports.render = function(state, props){
  throw new Error('You gotta implement render, should be quick.');
};

/**
 * Render children initially.
 *
 * @param {String} id DOMElement id
 * @return {String} html
 * @api public
 */

exports.create = function(id){
  this.id = id;
  this.lifecycle = 'create';
  this.emit('create');
  this.node = this.render(this.state, this.props);
  this.enqueue(this.created);
};

/**
 * Convert to HTML
 *
 * @return {String}
 */

exports.toString = function(){
  this.create();
  return this.node.toString();
};

/**
 * Update attributes.
 *
 * @return {Patch}
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
};

/**
 * Unmount the component.
 *
 * @api public
 */

exports.remove = function(){
  this.lifecycle = 'remove';
  this.emit('remove');
  // recursively remove
  this.component.remove();
  this.component = null;
  this.node = null;
  this.id = null;
  this.lifecycle = 'removed';
};

/**
 * Set properties on `this.state`.
 *
 * @param {Object} state State to merge with existing state.
 * @api public
 */

exports.set = function(state){
  // TODO: maybe batch into a global/single transaction per frame?
  if (2 == arguments.length) {
    this.state[arguments[0]] = arguments[1];
  } else {
    merge(this.state, state);
  }
  this.invalidate();
};

/**
 * Run `update` on the next frame.
 *
 * @api private
 */

exports.invalidate = function(){
  // changes take effect immediately if happening during create.
  if ('create' == this.lifecycle) return;
  renderer.add(this);
};

/**
 * Enqueue updates on the next frame.
 *
 * @param {Function} fn
 * @api public
 */

exports.enqueue = function(fn){
  frame.once(fn);
};

/**
 * Emit `created` on the next frame.
 *
 * @api private
 */

exports.created = function(){
  this.lifecycle = 'created';
  this.emit('created');
};

/**
 * Emit `updated` on the next frame.
 *
 * @api private
 */

exports.updated = function(){
  this.lifecycle = 'updated';
  this.emit('updated');
};
