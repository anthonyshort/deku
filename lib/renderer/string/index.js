var virtual = require('../../virtual');
var Entity = require('../../entity');

/**
 * Export
 */

module.exports = render;

/**
 * Render a component to a string
 *
 * @param {Entity}
 *
 * @return {String}
 */

function render(entity) {
  var tree = entity.render();
  return nodeToString(tree.root, tree);
}

/**
 * Render a node to a string
 *
 * @param {Node} node
 * @param {Tree} tree
 *
 * @return {String}
 */

function nodeToString(node, tree) {
  var path = tree.getPath(node);

  // text
  if (node.type === 'text') {
    return node.data;
  }

  // element
  if (node.type === 'element') {
    var children = node.children;
    var attributes = node.attributes;
    var tagName = node.tagName;
    var str = '<' + tagName + attrs(attributes) + '>';

    for (var i = 0, n = children.length; i < n; i++) {
      str += nodeToString(children[i], tree);
    }
    str += '</' + tagName + '>';
    return str;
  }

  // component
  if (node.type === 'component') {
    return render(new Entity(node.component, node.props));
  }

  throw new Error('Invalid type');
}

/**
 * HTML attributes to string.
 *
 * @param {Object} attributes
 * @return {String}
 * @api private
 */

function attrs(attributes) {
  var str = '';
  for (var key in attributes) {
    str += attr(key, attributes[key]);
  }
  return str;
}

/**
 * HTML attribute to string.
 *
 * @param {String} key
 * @param {String} val
 * @return {String}
 * @api private
 */

function attr(key, val) {
  return ' ' + key + '="' + val + '"';
}
