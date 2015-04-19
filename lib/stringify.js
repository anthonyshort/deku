
/**
 * Expose `stringify`.
 */

module.exports = stringify;

/**
 * Render to string.
 *
 * @param {Component} component
 * @param {Object} [props]
 * @return {String}
 */

function stringify(component, props) {
  props = props || {};
  var state = component.initialState();
  component.beforeMount();
  var node = component.render(props, state);
  return stringifyNode(node, '0');
};

/**
 * Render a node to a string
 *
 * @param {Node} node
 * @param {Tree} tree
 *
 * @return {String}
 */

function stringifyNode(node, path) {
  switch (node.type) {
    case 'text': return node.data;
    case 'element':
      var children = node.children;
      var attributes = node.attributes;
      var tagName = node.tagName;
      var innerHTML = attributes.innerHTML;
      var str = '<' + tagName + attrs(attributes) + '>';

      if (innerHTML) {
        str += innerHTML;
      } else {
        for (var i = 0, n = children.length; i < n; i++) {
          str += stringifyNode(children[i], path + '.' + i);
        }
      }

      str += '</' + tagName + '>';
      return str;
    case 'component': return stringify(node.component, node.props);
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
    if (key === 'innerHTML') continue;
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
