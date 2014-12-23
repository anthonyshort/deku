
/**
 * Initialize a new `ComponentNode`.
 *
 * @param {Component} component
 * @param {Object} props
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual nodes
 * @api public
 */

module.exports = function(component, props, key, children) {
  var node = {};
  node.key = key;
  node.props = props;
  node.type = 'component';
  node.component = component;
  node.props.children = children || [];
  return node;
};
