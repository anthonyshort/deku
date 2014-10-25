
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
  buf.push('<', tagName);
  // buf.push(' id="', id, '"');
  attrs(buf, attributes);
  buf.push('>');
  for (var i = 0, n = children.length; i < n; i++) {
    var child = children[i];
    buf.push(child.toString());
  }
  buf.push('</', tagName, '>');
  return buf.join('');
};

/**
 * HTML attributes to string.
 *
 * @param {Array} buf
 * @param {Object} attributes
 * @api private
 */

function attrs(buf, attributes) {
  for (var key in attributes) {
    var value = attributes[key];

    // if it's `false`, don't include the attribute.
    if (value === false) continue;

    // array.
    if (Array.isArray(value)) {
      // blank arrays don't count
      if (value.length === 0) continue;
      attr(buf, key, value.join(' '));
      continue;
    }

    // object.
    if (Object(value) === value) {
      for (var name in value) {
        attr(buf, key + '-' + name, value[name]);
      }
      continue;
    }

    // string/number/basic.
    attr(buf, key, value);
  }
}

/**
 * HTML attribute to string.
 *
 * @param {Array} buf
 * @param {String} key
 * @param {String} val
 * @api private
 */

function attr(buf, key, val) {
  buf.push(' ', key, '="', val, '"');
}
