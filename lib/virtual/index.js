
/**
 * Module dependencies.
 */

var ComponentNode = require('./component');
var ElementNode = require('./element');
var TextNode = require('./text');
var tree = require('./tree');

/**
 * Exports.
 */

exports.node = dom;
exports.tree = tree;

/**
 * ID counter.
 */

var i = 0;

/**
 * Create virtual DOM trees.
 *
 * This creates the nicer API for the user.
 * It translates that friendly API into an actual tree of nodes.
 *
 * @param {String|Function} type
 * @param {Object} props
 * @param {Array} children
 * @return {Node}
 * @api public
 */

function dom(type, props, children) {
  children = children || [];
  props = props || {};

  if (!Array.isArray(children)) children = [ children ];

  children = children.map(normalize);

  // pull the key out from the data.
  var key = props.key;
  delete props.key;

  // if you pass in a function, it's a `Component` constructor.
  // otherwise it's an element.
  if ('function' == typeof type) {
    var node = ComponentNode(type, props, key, children);
  } else {
    var node = ElementNode(type, props, key, children);
  }

  // set the unique ID
  node.id = (i++).toString(32);

  return node;
}

/**
 * Parse nodes into real `Node` objects.
 *
 * @param {Mixed} node
 * @param {Integer} index
 * @return {Node}
 * @api private
 */

function normalize(node, index) {
  if (typeof node === 'string' || typeof node === 'number') {
    node = TextNode(String(node));
  }
  if (Array.isArray(node)) {
    throw new Error('Child node cant be an array. This can happen if you try to use props.children like a node.');
  }
  node.index = index;
  return node;
}
