
/**
 * Expose `ComponentNode`.
 */

module.exports = ComponentNode;

/**
 * Initialize a new `ComponentNode`.
 *
 * @param {Component} component
 * @param {Object} props
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual nodes
 * @api public
 */

function ComponentNode(component, props, key, children) {
  this.key = key;
  this.props = props;
  this.type = 'component';
  this.component = component;
  this.props.children = children || [];
}
