
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
 * @api public
 */

function ComponentNode(component, props, key) {
  this.key = key;
  this.props = props;
  this.type = 'component';
  this.component = component;
}
