
/**
 * Module dependencies.
 */

var VirtualElement = require('./lib/element');
var Component = require('./lib/component');
var VirtualNode = require('./lib/node');
var VirtualText = require('./lib/text');

/**
 * DOM mapping.
 */

var elements = {
  text: VirtualText,
  default: VirtualElement
};

/**
 * Expose `dom`.
 */

exports = module.exports = createNode;
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
 * @param {Object} attributes
 * @param {Array} children
 *
 * @return {VirtualNode}
 */

function createNode(type, attributes, children) {
  var list = (children || []).map(normalize);
  // TODO: this can be abstracted away if we have another `Dom` object.
  if ('function' == typeof type) {
    var tagName = type.tagName;
  } else {
    var tagName = type;
    type = elements[type] || elements['default'];
  }
  var node = new VirtualNode(tagName, type, attributes, list);
  return node;
}

/**
 * Parse nodes into real VirtualNodes
 */

function normalize(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    return createNode('text', node);
  }
  return node;
}

/**
 * Mount.
 */

function mount(type, attributes, el) {
  var node = createNode(type, attributes);
  el.appendChild(node.render());
}
