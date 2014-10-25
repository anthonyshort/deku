
/**
 * Module dependencies.
 */

var ElementComponent = require('./lib/component/element');
var TextComponent = require('./lib/component/text');
var Component = require('./lib/component');
var renderer = require('./lib/renderer'); // hack ftm
var VirtualNode = require('./lib/node');

/**
 * DOM mapping.
 */

var elements = {
  text: TextComponent,
  default: ElementComponent
};

/**
 * Expose `dom`.
 */

exports = module.exports = dom;
exports.dom = exports;

/**
 * Expose `component`.
 */

exports.component = Component;

/**
 * Expose `mount`.
 */

exports.mount = mount;

/**
 * Create virtual DOM trees.
 *
 * @param {String|Function} type
 * @param {Object} attributes
 * @param {Array} children
 * @return {VirtualNode}
 * @api public
 */

function dom(factory, attributes, children) {
  // TODO: this can be abstracted away if we have another `Dom` object.
  if ('function' == typeof factory) {
    var tagName = factory.tagName;
  } else {
    var tagName = factory;
    factory = elements[factory] || elements['default'];
  }
  var node = new VirtualNode(tagName, factory, attributes, children);
  return node;
}

/**
 * Mount.
 *
 * @param {String|Function} type
 * @param {Object} attributes
 * @param {Array} children
 * @api public
 */

function mount(factory, attributes, container) {
  var node = dom(factory, attributes);
  var rootId = renderer.cache(container);
  node.create(rootId, rootId + '.' + 0);
  var el = node.render();
  container.appendChild(el);
}
