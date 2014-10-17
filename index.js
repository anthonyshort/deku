module.exports = createElement;

/**
 * Dependencies
 */

var VirtualElement = require('./lib/element');
var VirtualNode = require('./lib/node');
var VirtualText = require('./lib/text');

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