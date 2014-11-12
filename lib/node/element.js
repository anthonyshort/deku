
/**
 * Expose `ElementNode`.
 */

module.exports = ElementNode;

/**
 * Initialize a new `ElementNode`.
 *
 * @param {Node} node
 * @api public
 */

function ElementNode(tagName, attributes, key, children) {
  this.type = 'element';
  this.tagName = tagName || 'div';
  this.attributes = attributes;
  this.attributes.key = key;
  this.children = children;
}

/**
 * Convert a virtual element into HTML markup.
 *
 * This can be used to render on the server.
 *
 * @return {String}
 * @api public
 */

ElementNode.prototype.toString = function(){
  var children = this.children;
  var attributes = this.attributes;
  var tagName = this.tagName;
  var str = '<' + tagName + attrs(attributes) + '>';
  for (var i = 0, n = children.length; i < n; i++) {
    var child = children[i];
    str += child.toString();
  }
  str += '</' + tagName + '>';
  return str;
}

/**
 * Convert this node and all it's children into
 * real DOM elements and return it.
 *
 * @return {Element}
 */

ElementNode.prototype.toElement = function(){
  var el = document.createElement(this.tagName);

  // Attributes
  for (var name in this.attributes) {
    el.setAttribute(name, this.attributes[name]);
  }

  // Children
  for (var i = 0, n = children.length; i < n; i++) {
    el.appendChild(children[i].toElement());
  }

  return el;
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
    var value = attributes[key];

    // if it's `false`, don't include the attribute.
    if (value === false) continue;

    // array.
    if (Array.isArray(value)) {
      // blank arrays don't count
      if (value.length === 0) continue;
      str += attr(key, value.join(' '));
      continue;
    }

    // object.
    if (Object(value) === value) {
      for (var name in value) {
        str += attr(key + '-' + name, value[name]);
      }
      continue;
    }

    // string/number/basic.
    str += attr(key, value);
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
