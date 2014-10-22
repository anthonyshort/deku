
/**
 * Module dependencies.
 */

var VirtualElement = require('./lib/element');
var Component = require('./lib/component');
var VirtualNode = require('./lib/node');
var VirtualText = require('./lib/text');

/**
 * Expose `dom`.
 */

exports = module.exports = createElement;
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
 * Create virtual DOM trees
 *
 * @param {String} type
 * @param {Object} attrs
 * @param {Array} children
 *
 * @return {VirtualNode}
 */

function createElement(type, attrs, children) {
  var list = (children || []).map(normalize);
  var element = new VirtualElement(type, attrs);
  var node = new VirtualNode(element, list);
  return node;
}

/**
 * Parse nodes into real VirtualNodes
 */

function normalize(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    var element = new VirtualText(node);
    return new VirtualNode(element);
  }
  return node;
}

/**
 * Mount.
 */

function mount(type, attrs, el) {
  var node = createElement(type, attrs);
  console.log(node.render())
  el.appendChild(node.render());
}
