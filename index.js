
/**
 * Module dependencies.
 */

var Element = require('./lib/component/element');
var Text = require('./lib/component/text');
var component = require('./lib/component');
var Node = require('./lib/node');

/**
 * Expose `dom`.
 */

exports.dom = dom;

/**
 * Expose `component`.
 */

exports.component = component;

/**
 * Create virtual DOM trees. This creates the
 * nicer API for the user. It translate that friendly
 * API into an actual tree of nodes
 *
 * @param {String|Function} type
 * @param {Object} props
 * @param {Array} children
 * @return {VirtualNode}
 * @api public
 */

function dom(type, props, children) {
  var node;

  // Normalize the values
  props = props || {};
  children = (children || []).map(normalize);

  // Pull the key out from the data
  var key = props.key;
  delete props.key;

  // It is a component
  if ('function' == typeof type) {
    return new Node('component', type, children, {
      key: key,
      props: props
    });
  }

  // It is an element
  return new Node('element', Element, children, {
    key: key,
    tagName: type,
    attributes: props
  });
}

/**
 * Parse nodes into real VirtualNodes.
 *
 * @param {Mixed} value
 * @return {VirtualNode}
 * @api private
 */

function normalize(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return new Node('text', Text, null, { text: value });
  }
  return value;
}
