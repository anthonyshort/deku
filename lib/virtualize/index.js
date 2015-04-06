
/**
 * Module dependencies.
 */

var ComponentNode = require('./component');
var ElementNode = require('./element');
var TextNode = require('./text');
var tree = require('./tree');
var slice = require('sliced');
var uid = require('get-uid');

/**
 * Exports.
 */

exports.node = dom;
exports.tree = tree;

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

  // Skipped adding attributes and we're passing
  // in children instead.
  if (arguments.length === 2 && (typeof props === 'string' || Array.isArray(props))) {
    children = props;
    props = {};
  }

  // Account for JSX putting the children as multiple arguments.
  // This is essentially just the ES6 rest param
  if (arguments.length > 2 && Array.isArray(arguments[2]) === false) {
    children = slice(arguments, 2);
  }

  children = children || [];
  props = props || {};

  // passing in a single child, you can skip
  // using the array
  if (!Array.isArray(children)) {
    children = [ children ];
  }

  children = children
    .filter(notEmpty)
    .reduce(flatten, [])
    .map(textNodes)
    .map(addIndex);

  // pull the key out from the data.
  var key = props.key;
  delete props.key;

  // if you pass in a function, it's a `Component` constructor.
  // otherwise it's an element.
  var node;
  if ('function' == typeof type) {
    node = new ComponentNode(type, props, key, children);
  } else {
    node = new ElementNode(type, props, key, children);
  }

  // set the unique ID
  node.id = uid();
  node.index = 0;

  return node;
}

/**
 * Remove null/undefined values from the array
 *
 * @param {*} value
 *
 * @return {Boolean}
 */

function notEmpty(value) {
  return value !== null && value !== undefined;
}

/**
 * Flatten nested array
 *
 * @param {Array} arr
 * @param {*} value
 *
 * @return {Array}
 */

function flatten(result, node) {
  if (Array.isArray(node)) {
    result = result.concat(node);
  } else {
    result.push(node);
  }
  return result;
}

/**
 * Parse nodes into real `Node` objects.
 *
 * @param {Mixed} node
 * @param {Integer} index
 * @return {Node}
 * @api private
 */

function textNodes(node, index) {
  if (typeof node === 'string' || typeof node === 'number') {
    return new TextNode(String(node));
  } else {
    return node;
  }
}

/**
 * Add an index
 *
 * @param {Node} node
 * @param {Number} index
 *
 * @return {Node}
 */

function addIndex(node, index) {
  node.index = index;
  return node;
}
