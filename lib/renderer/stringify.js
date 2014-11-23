var dom = require('../node');
var Tree = require('./tree');

/**
 * Export
 */

module.exports = componentToString;

/**
 * Render a component to a string
 *
 * @param {Component} Component
 * @param {Object} optProps
 *
 * @return {String}
 */

function componentToString(Component, optProps) {
  var instance = new Component();
  var props = optProps || {};
  var state = instance.initialState();
  var node = instance.render(dom, state, props);
  var tree = new Tree(node);
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
    return componentToString(node.component, node.props);
  }

  debugger;
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
    var value = attributes[key];

    // if it's `false`, don't include the attribute.
    if (value === false) continue;

    // array.
    if (Array.isArray(value)) {
      // blank arrays don't count.
      if (value.length === 0) continue;
      str += attr(key, value.join(' '));
      continue;
    }

    // object.
    if (Object(value) === value) {
      for (var name in value) {
        str += attr(key + '-' + name, value[name]);
      }
      continue;
    }

    // string/number/basic.
    str += attr(key, value);
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
