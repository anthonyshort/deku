var domify = require('component/domify@1.3.1');
var merge = require('yields/merge');
var utils = require('./utils');
var diff = require('./diff');

/**
 * Create a new virtual node
 *
 * @param {String} type
 * @param {Object} attributes
 * @param {Array} children
 */

function Node(type, attrs, children) {
  if (!(this instanceof Node)) return new Node(type, attrs, children);
  this.type = type || 'div';
  this.attributes = attrs || {};
  this.children = children || [];
}

/**
 * Create a virtual-dom object from a
 * real DOM node
 *
 * @param {Element} el
 *
 * @return {Node}
 */

// Node.fromElement = function(el) {
//   var node;
//   if (el.nodeType === 3) {
//     node = el.data;
//   }
//   else {
//     node = new Node(el.tagName);
//     var attrs = slice.apply(el.attributes);
//     var children = slice.apply(el.childNodes);
//     attrs.forEach(function(attr){
//       node.set(attr.name, attr.value);
//     });
//     children
//       .map(fromElement)
//       .map(node.append.bind(node))
//   }
//   return node;
// };

// /**
//  * Set the attributes
//  *
//  * @param  {Object} attrs
//  */

// Node.prototype.attrs = function(attrs) {
//   if (typeof attrs === 'string') {
//     return this.attributes[attrs];
//   }
//   this.attributes = attrs;
//   return this;
// };

// /**
//  * Set the children
//  *
//  * @param {Array|Node} node
//  */

// Node.prototype.append = function(children) {
//   this.children = this.children.concat(children);
//   return this;
// };

/**
 * Set the classes
 */

// Node.prototype.class = function(classes) {
//   if (!classes) return this._classes;

//   if (Array.isArray(classes)) {
//     this._classes = classes;
//     return this;
//   }

//   this._classes = [];
//   for (var name in classes) {
//     if (classes[name]) this._classes.push(name);
//   }

//   return this;
// };

/**
 * Set the styles
 *
 * @param {Object} obj
 */

// Node.prototype.styles = function(obj) {
//   if (typeof obj === 'string') return this._styles[obj];
//   this._styles = obj;
//   return this;
// };

/**
 * Convert a node and all of its children into a string
 */

Node.prototype.toString = function() {
  var str = '';
  var props = utils.objectToAttributes(this.attributes);
  str += '<' + this.type;
  if (props) str += ' ' + props;
  str += '>';
  str += this.children.map(String).join("\n");
  str += '</' + this.type + '>';
  return str;
};

/**
 * Convert the node into an element
 */

Node.prototype.toElement = function() {
  return domify(this.toString());
};

/**
 * Diff with another node and produce a patch function
 */

Node.prototype.diff = function(b) {
  return diff(this, b);
};

/**
 * Export
 */

module.exports = Node;
