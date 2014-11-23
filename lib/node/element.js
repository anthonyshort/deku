var type = require('component/type');

/**
 * Expose `ElementNode`.
 */

module.exports = ElementNode;

/**
 * Initialize a new `ElementNode`.
 *
 * @param {String} tagName
 * @param {Object} attributes
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual dom nodes.
 * @api public
 */

function ElementNode(tagName, attributes, key, children) {
  this.type = 'element';
  this.tagName = tagName || 'div';
  this.attributes = parseAttributes(attributes);
  if (key) this.attributes['data-key'] = key;
  this.children = children || [];
  this.key = key;
}

/**
 * Parse attributes for some special cases.
 *
 * TODO: This could be more functional and allow hooks
 * into the processing of the attributes at a component-level
 *
 * @param {Object} attributes
 *
 * @return {Object}
 */

function parseAttributes(attributes) {

  // style: { 'text-align': 'left' }
  if (attributes.style) {
    attributes.style = parseStyle(attributes.style);
  }

  // data: { foo: 'bar' }
  if (attributes.data) {
    attributes = parseData(attributes);
  }

  // class: { foo: true, bar: false, baz: true }
  // class: ['foo', 'bar', 'baz']
  if (attributes.class) {
    attributes.class = parseClass(attributes.class);
  }

  // Remove attributes with false values
  for (var name in attributes) {
    if (attributes[name] === false) {
      delete attributes[name];
    }
  }

  return attributes;
}

/**
 * Parse a block of styles into a string.
 *
 * TODO: this could do a lot more with vendor prefixing,
 * number values etc. Maybe there's a way to allow users
 * to hook into this?
 *
 * @param {Object} styles
 *
 * @return {String}
 */

function parseStyle(styles) {
  if (type(styles) !== 'object') {
    return styles;
  }
  var str = '';
  for (var name in styles) {
    var value = styles[name];
    str += name + ':' + value + ';';
  }
  return str;
}

/**
 * Parse the dataset
 *
 * @param {Object} attributes
 *
 * @return {Object}
 */

function parseData(attributes) {
  if (type(attributes.data) !== 'object') {
    return attributes;
  }

  for (var name in attributes.data) {
    attributes['data-' + name] = attributes.data[name];
  }

  delete attributes.data;
  return attributes;
}

/**
 * Parse the class attribute so it's able to be
 * set in a more user-friendly way
 *
 * @param {String|Object|Array} value
 *
 * @return {String}
 */

function parseClass(value) {

  // { foo: true, bar: false, baz: true }
  if (type(value) === 'object') {
    var matched = [];
    for (var key in value) {
      if (value[key]) matched.push(key);
    }
    value = matched;
  }

  // ['foo', 'bar', 'baz']
  if (type(value) === 'array') {
    if (value.length === 0) {
      return;
    }
    value = value.join(' ');
  }

  return value;
}