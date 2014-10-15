module.exports = VirtualText;

function VirtualText(text) {
  this.text = text;
  this.type = 'text';
}

VirtualText.prototype.toString = function() {
  return this.text;
}

/**
 * Convert this virtual element into a real DOM element
 *
 * @return {Element}
 */

VirtualText.prototype.toElement = function() {
  return document.createTextNode(this.text);
}

/**
 * Get the traceable path for this node
 *
 * @return {Array}
 */

VirtualText.prototype.path = function () {
  var path = [];
  var node = this;
  while (node.parent) {
    path.unshift(node.index());
    node = node.parent;
  }
  return path.join('.');
}

VirtualText.prototype.index = function() {
  if (this.isRoot()) return 0;
  return this.parent.children.indexOf(this);
}

/**
 * Is this the root node of the tree?
 *
 * @return {Boolean}
 */

VirtualText.prototype.isRoot = function() {
  return this.parent === undefined;
}