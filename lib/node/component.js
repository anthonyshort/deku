
/**
 * Expose `ComponentNode`.
 */

module.exports = ComponentNode;

/**
 * Initialize a new `ComponentNode`.
 *
 * @param {Node} node
 * @api public
 */

function ComponentNode(component, props, key) {
  this.key = key;
  this.props = props;
  this.type = 'component';
  this.component = component;
}