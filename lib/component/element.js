
/**
 * Module dependencies.
 */

var objectToAttributes = require('../utils').objectToAttributes;

/**
 * Expose `ElementComponent`.
 */

module.exports = ElementComponent;

/**
 * Initialize a new `ElementComponent`.
 *
 * @param {VirtualNode} node
 * @api public
 */

function ElementComponent(node) {
  this.owner = node;
  this.tagName = node.tagName;
  this.attributes = node.attributes;
}

/**
 * Type checking.
 */

ElementComponent.nodeType = 'element';

/**
 * Create, called from a `Node` instance.
 *
 * @param {String} root Mounted component root.
 * @param {String} path Path from root to this element.
 * @api public
 */

ElementComponent.prototype.create = function(root, path){
  this.root = root;
  this.path = path;
  var children = this.owner.children;
  for (var i = 0, n = children.length; i < n; i++) {
    var child = children[i];
    child.create(root, path + '.' + i);
  }
};

/**
 * Convert a virtual element into HTML markup.
 *
 * This can be used to render on the server.
 *
 * @return {String}
 * @api public
 */

ElementComponent.prototype.toString = function(){
  var children = this.owner.children;
  var attributes = this.attributes;
  var tagName = this.tagName;
  var id = this.owner.path();
  var buf = [];
  var props = objectToAttributes(attributes);
  buf.push('<', tagName);
  // buf.push(' id="', id, '"');
  if (props) buf.push(' ', props);
  buf.push('>');
  for (var i = 0, n = children.length; i < n; i++) {
    var child = children[i];
    buf.push(child.toString());
  }
  buf.push('</', tagName, '>');
  return buf.join('');
};
