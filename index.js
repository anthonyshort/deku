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
  if (children) children = children.map(parse);
  var element = new VirtualElement(type, attrs, children);
  var node = new VirtualNode(element);
  return node;
}

/**
 * Add a child to this node
 */

function parse(node, index) {
  if (typeof node === 'string' || typeof node === 'number') {
    var element = new VirtualText(node);
    return new VirtualNode(element);
  }
  return node;
}