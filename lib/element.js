
/**
 * Module dependencies.
 */

var objectToAttributes = require('./utils').objectToAttributes;

/**
 * Expose `VirtualElement`.
 */

module.exports = VirtualElement;

/**
 * Initialize a new `VirtualElement`.
 *
 * @param {Node} node
 * @api public
 */

function VirtualElement(node) {
  this.owner = node;
  this.tagName = node.tagName;
  this.attributes = node.attributes;
}

/**
 * Type checking.
 */

VirtualElement.nodeType = 'element';

/**
 * Create, called from a `Node` instance.
 *
 * @param {String} root
 */

VirtualElement.prototype.create = function(root, path){
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

VirtualElement.prototype.toString = function(){
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
