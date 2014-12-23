var type = require('component/type');

/**
 * All of the events can bind to
 */

var events = {
  onBlur: 'blur',
  onChange: 'change',
  onClick: 'click',
  onCopy: 'copy',
  onCut: 'cut',
  onDblClick: 'dblclick',
  onDrag: 'drag',
  onDragEnd: 'dragend',
  onDragEnter: 'dragenter',
  onDragExit: 'dragexit',
  onDragLeave: 'dragleave',
  onDragOver: 'dragover',
  onDragStart: 'dragstart',
  onDrop: 'drop',
  onFocus: 'focus',
  onInput: 'input',
  onKeyDown: 'keydown',
  onKeyPress: 'keypress',
  onKeyUp: 'keyup',
  onMouseDown: 'mousedown',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
  onPaste: 'paste',
  onScroll: 'scroll',
  onSelectionChange: 'selectionchange',
  onTouchCancel: 'touchcancel',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchStart: 'touchstart',
  onWheel: 'wheel'
};

/**
 * Initialize a new `ElementNode`.
 *
 * @param {String} tagName
 * @param {Object} attributes
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual dom nodes.
 * @api public
 */

module.exports = function(tagName, attributes, key, children) {
  var node = {};
  node.type = 'element';
  node.tagName = tagName || 'div';
  node.attributes = parseAttributes(attributes);
  node.events = parseEvents(attributes);
  node.children = children || [];
  node.key = key;
  return node;
};

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

/**
 * Events are stored on the node and are creating using
 * special attributes
 *
 * @param {Object} attributes
 *
 * @return {Object}
 */

function parseEvents(attributes) {
  var ret = {};
  for (var name in events) {
    var type = events[name];
    var callback = attributes[name];
    if (callback) {
      ret[type] = callback;
      delete attributes[name];
    }
  }
  return ret;
}