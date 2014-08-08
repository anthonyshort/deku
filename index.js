var tags = require('./lib/tags');
var Node = require('./lib/node');
var TextNode = require('./lib/text');
var slice = Array.prototype.slice;

/**
 * Expose the node function as
 * the default export
 */

module.exports = exports = Node;

/**
 * Create methods for each HTML tag to
 * make writing templates niceer
 */

tags.forEach(function(name){
  exports[name] = function(attributes, children) {
    return new Node(name, attributes, children);
  };
});

/**
 * Expose the constructors in case there's a need
 * to create nodes directly
 */

exports.TextNode = TextNode;
exports.Node = Node;
exports.fromElement = fromElement;

/**
 * Create a virtual-dom object from a
 * real DOM node
 *
 * @param {Element} el
 *
 * @return {Node}
 */

function fromElement(el) {
  var node;
  if (el.nodeType === 3) {
    node = new TextNode(el.data);
  }
  else {
    node = new Node(el.tagName);
    var attrs = slice.apply(el.attributes);
    var children = slice.apply(el.childNodes);
    attrs.forEach(function(attr){
      node.set(attr.name, attr.value);
    });
    children
      .map(fromElement)
      .map(node.append.bind(node))
  }
  return node;
}