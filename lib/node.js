var VirtualTextNode = require('./text');

/**
 * Convert an object into attributes
 *
 * eg. { name: 'foo' } => name="foo"
 *
 * @param {Object} obj
 * @return {String}
 */

function objectToAttributes(obj) {
  return Object.keys(obj)
    .map(function(key){
      return key + '="' + String(obj[key]) + '"';
    })
    .join(' ');
}

/**
 * Create a new virtual node
 *
 * @param {String} type
 * @param {Object} attributes
 * @param {Array} children
 */

function VirtualNode(type, attributes, children) {
  if (!(this instanceof VirtualNode)) return new VirtualNode(type, attributes, children);

  // No attributes given
  if (attributes == null) {
    attributes = {};
  }

  // No child elements
  if (children == null) {
    children = [];
  }

  // Allow using a function to return attributes/children
  if (typeof attributes === 'function') {
    attributes = attributes(this);
  }

  // Allow using a function to return children
  if (typeof children === 'function') {
    children = children(this);
  }

  // Normalize children into an array
  if (!Array.isArray(children)) {
    children = [children];
  }

  this.type = type;
  this.attributes = attributes || {};
  this.children = children.map(function(child){
    if (typeof child === 'string') return new VirtualTextNode(child);
    if (typeof child.render === 'function') return child.render();
    return child;
  });
}

/**
 * Add a child element
 *
 * @param {VirtualNode} node
 */

VirtualNode.prototype.append = function(node) {
  this.children.push(node);
  return this;
};

/**
 * Set an attribute
 */

VirtualNode.prototype.set = function(attr, value) {
  this.attributes[attr] = value;
  return this;
};

/**
 * Convert a node and all of its children into a string
 */

VirtualNode.prototype.toString = function() {
  var str = '';
  var attrs = objectToAttributes(this.attributes);
  str += '<' + this.type;
  if (attrs) str += ' ' + attrs;
  str += '>';
  str += this.children.map(String).join("\n");
  str += '</' + this.type + '>';
  return str;
};

/**
 * Convert the node into an element
 */

VirtualNode.prototype.toElement = function() {
  var node = document.createElement(this.type);
  for (var key in this.attributes) {
    node.setAttribute(key, this.attributes[key]);
  }
  this.children.forEach(function(child){
    node.appendChild(child.toElement());
  });
  return node;
};

/**
 * Return a set of patches for the diff
 */

VirtualNode.prototype.diff = function(vnode) {
  return diff(this, vnode);
};

/**
 * Export
 */

module.exports = VirtualNode;