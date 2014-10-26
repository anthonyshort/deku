
/**
 * Expose `ElementComponent`.
 */

module.exports = ElementComponent;

/**
 * Initialize a new `ElementComponent`.
 *
 * @param {Node} node
 * @api public
 */

function ElementComponent(node) {
  this.owner = node;
  this.tagName = node.data.tagName || 'div';
  this.attributes = node.data.attributes;
}

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
}

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
  var str = '<' + tagName + attrs(attributes) + '>';
  // str += ' id="' + id + '"';
  for (var i = 0, n = children.length; i < n; i++) {
    var child = children[i];
    str += child.toString();
  }
  str += '</' + tagName + '>';
  return str;
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
