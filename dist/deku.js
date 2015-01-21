(function umd(_require){
  if ('object' == typeof exports) {
    module.exports = _require('1');
  } else if ('function' == typeof define && define.amd) {
    define(function(){ return _require('1'); });
  } else {
    this['deku'] = _require('1');
  }
})((function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function _require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, _require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, _require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return _require(dep ? dep : req);
    }, m, m.exports, outer, modules, cache, entries);

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = _require(id);
    } else {
      _require(id);
    }
  }

  /**
   * Duo flag.
   */

  _require.duo = true;

  /**
   * Expose cache.
   */

  _require.cache = cache;

  /**
   * Expose modules
   */

  _require.modules = modules;

  /**
   * Return newest require.
   */

   return _require;
})({
1: [function(_require, module, exports) {
exports.component = _require('./lib/component');
exports.dom = _require('./lib/virtual').node;
}, {"./lib/component":2,"./lib/virtual":3}],
2: [function(_require, module, exports) {

/**
 * Module dependencies.
 */

var assign = _require('sindresorhus/object-assign');
var bindAll = _require('segmentio/bind-all');
var Emitter = _require('component/emitter');
var statics = _require('./statics');
var protos = _require('./protos');
var dom = _require('../virtual').node;

/**
 * Expose `component`.
 */

module.exports = component;

/**
 * Generate a new `Component` constructor.
 *
 * @param {Object} spec
 * @return {Function} Component
 * @api public
 */

function component(spec) {
  spec = spec || {};

  // Alow just a render function.

  if (typeof spec === 'function') {
    spec = { render: spec };
  }

  /**
   * A component is a stateful virtual dom element.
   *
   * @api public
   */

  function Component() {
    if (!(this instanceof Component)) {
      return dom(Component, arguments[0], arguments[1]);
    }
    bindAll(this);
  }

  // for debugging.

  if (spec.displayName) {
    Component.displayName = spec.displayName;
    delete spec.displayName;
  }

  // statics.

  assign(Component, statics, Emitter.prototype);

  // protos.

  assign(Component.prototype, protos, spec, Emitter.prototype);

  return Component;
}

}, {"sindresorhus/object-assign":4,"segmentio/bind-all":5,"component/emitter":6,"./statics":7,"./protos":8,"../virtual":3}],
4: [function(_require, module, exports) {
'use strict';

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var pendingException;
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = Object.keys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			try {
				to[keys[i]] = from[keys[i]];
			} catch (err) {
				if (pendingException === undefined) {
					pendingException = err;
				}
			}
		}
	}

	if (pendingException) {
		throw pendingException;
	}

	return to;
};

}, {}],
5: [function(_require, module, exports) {

try {
  var bind = _require('bind');
  var type = _require('type');
} catch (e) {
  var bind = _require('bind-component');
  var type = _require('type-component');
}

module.exports = function (obj) {
  for (var key in obj) {
    var val = obj[key];
    if (type(val) === 'function') obj[key] = bind(obj, obj[key]);
  }
  return obj;
};
}, {"bind":9,"type":10}],
9: [function(_require, module, exports) {
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

}, {}],
10: [function(_require, module, exports) {
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val;
};

}, {}],
6: [function(_require, module, exports) {

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

}, {}],
7: [function(_require, module, exports) {

/**
 * Module dependencies.
 */

var renderString = _require('../renderer/string');
var Entity = _require('../entity');
var Scene = _require('../scene');

/**
 * Browser dependencies.
 */

if (typeof window !== 'undefined') {
  var HTMLRenderer = _require('../renderer/html');
}

/**
 * Use plugin.
 *
 * @param {Function|Object} plugin Passing an object will extend the prototype.
 * @return {Component}
 * @api public
 */

exports.use = function(plugin){
  if ('function' === typeof plugin) {
    plugin(this);
  } else {
    for (var k in plugin) this.prototype[k] = plugin[k];
  }
  return this;
};

/**
 * Mount this component to a node. Only available
 * in the browser as it requires the DOM.
 *
 * @param {HTMLElement} container
 * @param {Object} props
 */

exports.render = function(container, props){
  if (!HTMLRenderer) throw new Error('You can only render a DOM tree in the browser. Use renderString instead.');
  var renderer = new HTMLRenderer(container);
  var entity = new Entity(this, props);
  var scene = new Scene(renderer, entity);
  return scene;
};

/**
 * Render this component to a string.
 *
 * @param {Object} props
 */

exports.renderString = function(props){
  var entity = new Entity(this, props);
  return renderString(entity);
};

}, {"../renderer/string":11,"../entity":12,"../scene":13,"../renderer/html":14}],
11: [function(_require, module, exports) {
var virtual = _require('../../virtual');
var Entity = _require('../../entity');

/**
 * Export
 */

module.exports = render;

/**
 * Render a component to a string
 *
 * @param {Entity}
 *
 * @return {String}
 */

function render(entity) {
  var tree = entity.render();
  return nodeToString(tree.root, tree);
}

/**
 * Render a node to a string
 *
 * @param {Node} node
 * @param {Tree} tree
 *
 * @return {String}
 */

function nodeToString(node, tree) {
  var path = tree.getPath(node);

  // text
  if (node.type === 'text') {
    return node.data;
  }

  // element
  if (node.type === 'element') {
    var children = node.children;
    var attributes = node.attributes;
    var tagName = node.tagName;
    var str = '<' + tagName + attrs(attributes) + '>';

    for (var i = 0, n = children.length; i < n; i++) {
      str += nodeToString(children[i], tree);
    }
    str += '</' + tagName + '>';
    return str;
  }

  // component
  if (node.type === 'component') {
    return render(new Entity(node.component, node.props));
  }

  throw new Error('Invalid type');
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
    str += attr(key, attributes[key]);
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

}, {"../../virtual":3,"../../entity":12}],
3: [function(_require, module, exports) {

/**
 * Module dependencies.
 */

var ComponentNode = _require('./component');
var ElementNode = _require('./element');
var TextNode = _require('./text');
var tree = _require('./tree');

/**
 * Exports.
 */

exports.node = dom;
exports.tree = tree;

/**
 * ID counter.
 */

var i = 0;

/**
 * Create virtual DOM trees.
 *
 * This creates the nicer API for the user.
 * It translates that friendly API into an actual tree of nodes.
 *
 * @param {String|Function} type
 * @param {Object} props
 * @param {Array} children
 * @return {Node}
 * @api public
 */

function dom(type, props, children) {

  // Skipped adding attributes and we're passing
  // in children instead.
  if (arguments.length === 2 && (typeof props === 'string' || Array.isArray(props))) {
    children = props;
    props = {};
  }

  children = children || [];
  props = props || {};

  // passing in a single child, you can skip
  // using the array
  if (!Array.isArray(children)) {
    children = [ children ];
  }

  children = children.map(normalize);

  // pull the key out from the data.
  var key = props.key;
  delete props.key;

  // if you pass in a function, it's a `Component` constructor.
  // otherwise it's an element.
  var node;
  if ('function' == typeof type) {
    node = ComponentNode(type, props, key, children);
  } else {
    node = ElementNode(type, props, key, children);
  }

  // set the unique ID
  node.id = (++i).toString(32);

  return node;
}

/**
 * Parse nodes into real `Node` objects.
 *
 * @param {Mixed} node
 * @param {Integer} index
 * @return {Node}
 * @api private
 */

function normalize(node, index) {
  if (typeof node === 'string' || typeof node === 'number') {
    node = TextNode(String(node));
  }
  if (Array.isArray(node)) {
    throw new Error('Child node cant be an array. This can happen if you try to use props.children like a node.');
  }
  node.index = index;
  return node;
}

}, {"./component":15,"./element":16,"./text":17,"./tree":18}],
15: [function(_require, module, exports) {

/**
 * Initialize a new `ComponentNode`.
 *
 * @param {Component} component
 * @param {Object} props
 * @param {String} key Used for sorting/replacing during diffing.
 * @param {Array} children Child virtual nodes
 * @api public
 */

module.exports = function(component, props, key, children) {
  var node = {};
  node.key = key;
  node.props = props;
  node.type = 'component';
  node.component = component;
  node.props.children = children || [];
  return node;
};

}, {}],
16: [function(_require, module, exports) {
var type = _require('component/type');

/**
 * All of the events can bind to
 */

var events = {
  onBlur: 'blur',
  onChange: 'change',
  onClick: 'click',
  onContextMenu: 'contextmenu',
  onCopy: 'copy',
  onCut: 'cut',
  onDoubleClick: 'dblclick',
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
  onKeyUp: 'keyup',
  onMouseDown: 'mousedown',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
  onPaste: 'paste',
  onScroll: 'scroll',
  onSubmit: 'submit',
  onTouchCancel: 'touchcancel',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchStart: 'touchstart'
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
  node.attributes = parseAttributes(attributes);
  node.events = parseEvents(attributes);
  node.tagName = parseTag(tagName, attributes);
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

/**
 * Parse the tag to allow using classes and ids
 * within the tagname like in CSS.
 *
 * @param {String} name
 * @param {Object} attributes
 *
 * @return {String}
 */

function parseTag(name, attributes) {
  if (!name) return 'div';

  var parts = name.split(/([\.#]?[a-zA-Z0-9_:-]+)/);
  var tagName = 'div';

  parts
    .filter(Boolean)
    .forEach(function(part, i){
      var type = part.charAt(0);
      if (type === '.') {
        attributes.class = ((attributes.class || '') + ' ' + part.substring(1, part.length)).trim();
      } else if (type === '#') {
        attributes.id = part.substring(1, part.length);
      } else {
        tagName = part;
      }
    });

  return tagName;
}
}, {"component/type":10}],
17: [function(_require, module, exports) {

/**
 * Initialize a new `TextNode`.
 *
 * This is just a virtual HTML text object.
 *
 * @param {String} text
 * @api public
 */

module.exports = function(text) {
  var node = {};
  node.type = 'text';
  node.data = String(text);
  return node;
};
}, {}],
18: [function(_require, module, exports) {

/**
 * Export `Tree`.
 */

module.exports = function(node) {
  return new Tree(node);
};

/**
 * A tree is representation of Node that is easier
 * to parse and diff. The tree should be considered
 * immutable and won't change.
 *
 * @param {Node} node
 */

function Tree(node) {
  this.root = node;
  this.paths = {};
  this.nodes = {};
  this.components = {};
  this.parse(node);
}

/**
 * Get the path for a node.
 *
 * @param {Node} node
 * @return {String}
 */

Tree.prototype.getPath = function(node){
  return this.paths[node.id];
};

/**
 * Get the node at a path
 *
 * @param {String} path
 *
 * @return {Node}
 */

Tree.prototype.getNode = function(path){
  return this.nodes[path];
};

/**
 * Parse a Node into a hash table. This allows
 * us to quickly find the path for a node and to
 * find a node at any path.
 *
 * @param {Node} node
 * @param {String} path
 * @return {Object}
 */

Tree.prototype.parse = function(node, path){
  path = path || '0';
  this.paths[node.id] = path;
  this.nodes[path] = node;
  if (node.type === 'component') {
    this.components[path] = node;
  }
  if (node.children) {
    node.children.forEach(function(node, index){
      this.parse(node, path + '.' + (node.key || index));
    }, this);
  }
};

}, {}],
12: [function(_require, module, exports) {

/**
 * Module dependencies.
 */

var assign = _require('sindresorhus/object-assign');
var Emitter = _require('component/emitter');
var equals = _require('jkroso/equals');
var each = _require('component/each');
var virtual = _require('../virtual');

/**
 * ID counter.
 */

var i = 0;

/**
 * Expose `Entity`.
 */

module.exports = Entity;

/**
 * A rendered component instance.
 *
 * This manages the lifecycle, props and state of the component.
 *
 * @param {Function} Component
 * @param {Object} props
 */

function Entity(Component, props) {
  this.id = (++i).toString(32);
  this.type = Component;
  this.component = new Component();
  this.component.on('change', this.setState.bind(this));
  this.props = props || {};
  this.state = this.component.initialState(this.props);
  this.children = {};
  this.current = this.render();
  this.previous = null;
  this.dirty = false;
  this.lifecycle = null;
  this._pendingProps = null;
  this._pendingState = null;
  this._propsReplaced = false;
}

/**
 * Entity is an emitter.
 */

Emitter(Entity.prototype);

/**
 * Get an updated version of the virtual tree.
 *
 * @return {VirtualTree}
 */

Entity.prototype.render = function(){
  this.lifecycle = 'rendering';
  var node = this.component.render(this.props, this.state);
  this.lifecycle = null;
  if (!node) {
    node = virtual.node('noscript');
  }
  return virtual.tree(node);
};

/**
 * Set the props.
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

Entity.prototype.setProps = function(nextProps, done){
  if (done) this.once('update', done);
  this._pendingProps = assign(this._pendingProps || {}, nextProps);
  this.propsChanged(nextProps);
  this.invalidate();
};

/**
 * Replace all the properties
 *
 * @param {Object} nextProps
 * @param {Function} done
 */

Entity.prototype.replaceProps = function(nextProps, done){
  if (done) this.once('update', done);
  this._propsReplaced = true;
  this._pendingProps = nextProps;
  this.propsChanged(nextProps);
  this.invalidate();
};

/**
 * Set the state. This can be called multiple times
 * and the state will be MERGED.
 *
 * @param {Object} nextState
 * @param {Function} done
 */

Entity.prototype.setState = function(nextState, done){
  if (this.lifecycle === 'beforeUpdate') {
    throw new Error('You can\'t call setState in the beforeUpdate hook. Use the propsChanged hook instead.');
  }
  if (this.lifecycle === 'rendering') {
    throw new Error('You can\'t call setState in the render hook. This method must remain pure.');
  }
  if (done) this.once('update', done);
  this._pendingState = assign(this._pendingState || {}, nextState);
  this.invalidate();
};

/**
 * Schedule this component to be updated on the next frame.
 */

Entity.prototype.invalidate = function(){
  this.dirty = true;
  if (this.scene) this.scene.dirty = true;
};

/**
 * Add an entity as a child of this entity
 *
 * @param {String} path
 * @param {Entity} entity
 */

Entity.prototype.addChild = function(path, Component, props){
  var child = new Entity(Component, props);
  this.children[path] = child;
  child.addToScene(this.scene);
  return child;
};

/**
 * Get the child entity at a path
 *
 * @param {String} path
 *
 * @return {Entity}
 */

Entity.prototype.getChild = function(path) {
  return this.children[path];
};

/**
 * Get the path of a node in it's current tree
 *
 * @param {Node} node
 *
 * @return {String}
 */

Entity.prototype.getPath = function(node) {
  return this.current.getPath(node);
};

/**
 * Add this entity to a Scene. Whenever this entity
 * is changed, it will mark the scene as dirty.
 *
 * @param {Scene} scene
 */

Entity.prototype.addToScene = function(scene){
  this.scene = scene;
};

/**
 * Remove an entity from this component and return it.
 *
 * @param {String} path
 *
 * @return {Entity}
 */

Entity.prototype.removeChild = function(path){
  var entity = this.children[path];
  entity.scene = null;
  delete this.children[path];
  return entity;
};

/**
 * Should this entity be updated and rendered?
 *
 * @param {Object} nextState
 * @param {Object} nextProps
 *
 * @return {Boolean}
 */

Entity.prototype.shouldUpdate = function(nextState, nextProps){
  if (nextProps && !equals(nextProps, this.props)) {
    return true;
  }
  if (nextState && !equals(nextState, this.state)) {
    return true;
  }
  return false;
};

/**
 * Update the props on the component.
 *
 * @return {Node}
 */

Entity.prototype.update = function(){
  var nextProps;

  // If we've flagged that we want all of the props replaced, we
  // won't merge it in, we'll replace it entirely.
  if (this._propsReplaced) {
    nextProps = this._pendingProps;
    this._propsReplaced = false;
  } else {
    nextProps = assign({}, this.props, this._pendingProps);
  }

  var nextState = assign({}, this.state, this._pendingState);

  // Compare the state and props to see if we really need to render
  if (!this.shouldUpdate(nextState, nextProps)) return false;

  // pre-update. This callback could mutate the
  // state or props just before the render occurs
  this.beforeUpdate(nextState, nextProps);

  // commit the changes.
  var previousState = this.state;
  var previousProps = this.props;
  this.state = nextState;
  this.props = nextProps || this.props;

  // reset.
  this._pendingState = null;
  this._pendingProps = null;

  // remove the force flag.
  delete this.state.__force__;

  // Signal that something changed
  return true;
};

/**
 * Set the current version of the tree and mark this
 * entity as not dirty. This is called once the entity
 * has been rendered/updated on the scene.
 *
 * @param {Tree} tree
 */

Entity.prototype.setCurrent = function(tree){
  this.previous = this.current;
  this.current = tree;
  this.dirty = false;
};

/**
 * Remove the component from the DOM.
 */

Entity.prototype.remove = function(){
  this.off();
  each(this.children, function(path, child){
    child.remove();
  });
  this.children = {};
};

/**
 * Trigger `beforeUpdate` lifecycle hook.
 *
 * @param {Object} nextState
 * @param {Object} nextProps
 */

Entity.prototype.beforeUpdate = function(nextState, nextProps){
  this.lifecycle = 'beforeUpdate';
  this.component.beforeUpdate(this.props, this.state, nextProps, nextState);
  this.type.emit('beforeUpdate', this.component, this.props, this.state, nextProps, nextState);
  this.lifecycle = null;
};

/**
 * Trigger `afterUpdate` lifecycle hook.
 *
 * @param {Object} previousState
 * @param {Object} previousProps
 */

Entity.prototype.afterUpdate = function(previousState, previousProps){
  this.emit('update');
  this.component.afterUpdate(this.props, this.state, previousProps, previousState);
  this.type.emit('afterUpdate', this.component, this.props, this.state, previousProps, previousState);
};

/**
 * Trigger `beforeUnmount` lifecycle hook.
 *
 * @param {HTMLElement} el
 */

Entity.prototype.beforeUnmount = function(el){
  this.component.beforeUnmount(el, this.props, this.state);
  this.type.emit('beforeUnmount', this.component, el, this.props, this.state);
};

/**
 * Trigger `afterUnmount` lifecycle hook.
 */

Entity.prototype.afterUnmount = function(){
  this.component.afterUnmount(this.props, this.state);
  this.type.emit('afterUnmount', this.component, this.props, this.state);
};

/**
 * Trigger `beforeMount` lifecycle hook.
 */

Entity.prototype.beforeMount = function(){
  this.component.beforeMount(this.props, this.state);
  this.type.emit('beforeMount', this.component, this.props, this.state);
};

/**
 * Trigger `afterMount` lifecycle hook.
 *
 * @param {HTMLElement} el
 */

Entity.prototype.afterMount = function(el){
  this.component.afterMount(el, this.props, this.state);
  this.type.emit('afterMount', this.component, el, this.props, this.state);
};

/**
 * Trigger `propsChanged` lifecycle hook.
 *
 * @param {Object} nextProps
 */

Entity.prototype.propsChanged = function(nextProps){
  this.component.propsChanged(nextProps, this.props, this.state);
  this.type.emit('propsChanged', this.component, nextProps, this.props, this.state);
};
}, {"sindresorhus/object-assign":4,"component/emitter":6,"jkroso/equals":19,"component/each":20,"../virtual":3}],
19: [function(_require, module, exports) {
var type = _require('type')

// (any, any, [array]) -> boolean
function equal(a, b, memos){
  // All identical values are equivalent
  if (a === b) return true
  var fnA = types[type(a)]
  var fnB = types[type(b)]
  return fnA && fnA === fnB
    ? fnA(a, b, memos)
    : false
}

var types = {}

// (Number) -> boolean
types.number = function(a, b){
  return a !== a && b !== b/*Nan check*/
}

// (function, function, array) -> boolean
types['function'] = function(a, b, memos){
  return a.toString() === b.toString()
    // Functions can act as objects
    && types.object(a, b, memos)
    && equal(a.prototype, b.prototype)
}

// (date, date) -> boolean
types.date = function(a, b){
  return +a === +b
}

// (regexp, regexp) -> boolean
types.regexp = function(a, b){
  return a.toString() === b.toString()
}

// (DOMElement, DOMElement) -> boolean
types.element = function(a, b){
  return a.outerHTML === b.outerHTML
}

// (textnode, textnode) -> boolean
types.textnode = function(a, b){
  return a.textContent === b.textContent
}

// decorate `fn` to prevent it re-checking objects
// (function) -> function
function memoGaurd(fn){
  return function(a, b, memos){
    if (!memos) return fn(a, b, [])
    var i = memos.length, memo
    while (memo = memos[--i]) {
      if (memo[0] === a && memo[1] === b) return true
    }
    return fn(a, b, memos)
  }
}

types['arguments'] =
types.array = memoGaurd(arrayEqual)

// (array, array, array) -> boolean
function arrayEqual(a, b, memos){
  var i = a.length
  if (i !== b.length) return false
  memos.push([a, b])
  while (i--) {
    if (!equal(a[i], b[i], memos)) return false
  }
  return true
}

types.object = memoGaurd(objectEqual)

// (object, object, array) -> boolean
function objectEqual(a, b, memos) {
  if (typeof a.equal == 'function') {
    memos.push([a, b])
    return a.equal(b, memos)
  }
  var ka = getEnumerableProperties(a)
  var kb = getEnumerableProperties(b)
  var i = ka.length

  // same number of properties
  if (i !== kb.length) return false

  // although not necessarily the same order
  ka.sort()
  kb.sort()

  // cheap key test
  while (i--) if (ka[i] !== kb[i]) return false

  // remember
  memos.push([a, b])

  // iterate again this time doing a thorough check
  i = ka.length
  while (i--) {
    var key = ka[i]
    if (!equal(a[key], b[key], memos)) return false
  }

  return true
}

// (object) -> array
function getEnumerableProperties (object) {
  var result = []
  for (var k in object) if (k !== 'constructor') {
    result.push(k)
  }
  return result
}

module.exports = equal

}, {"type":21}],
21: [function(_require, module, exports) {

var toString = {}.toString
var DomNode = typeof window != 'undefined'
  ? window.Node
  : Function

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = exports = function(x){
  var type = typeof x
  if (type != 'object') return type
  type = types[toString.call(x)]
  if (type) return type
  if (x instanceof DomNode) switch (x.nodeType) {
    case 1:  return 'element'
    case 3:  return 'text-node'
    case 9:  return 'document'
    case 11: return 'document-fragment'
    default: return 'dom-node'
  }
}

var types = exports.types = {
  '[object Function]': 'function',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Arguments]': 'arguments',
  '[object Array]': 'array',
  '[object String]': 'string',
  '[object Null]': 'null',
  '[object Undefined]': 'undefined',
  '[object Number]': 'number',
  '[object Boolean]': 'boolean',
  '[object Object]': 'object',
  '[object Text]': 'text-node',
  '[object Uint8Array]': 'bit-array',
  '[object Uint16Array]': 'bit-array',
  '[object Uint32Array]': 'bit-array',
  '[object Uint8ClampedArray]': 'bit-array',
  '[object Error]': 'error',
  '[object FormData]': 'form-data',
  '[object File]': 'file',
  '[object Blob]': 'blob'
}

}, {}],
20: [function(_require, module, exports) {

/**
 * Module dependencies.
 */

try {
  var type = _require('type');
} catch (err) {
  var type = _require('component-type');
}

var toFunction = _require('to-function');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`
 * in optional context `ctx`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @param {Object} [ctx]
 * @api public
 */

module.exports = function(obj, fn, ctx){
  fn = toFunction(fn);
  ctx = ctx || this;
  switch (type(obj)) {
    case 'array':
      return array(obj, fn, ctx);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn, ctx);
      return object(obj, fn, ctx);
    case 'string':
      return string(obj, fn, ctx);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function string(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function object(obj, fn, ctx) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn.call(ctx, key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function array(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj[i], i);
  }
}

}, {"type":22,"component-type":22,"to-function":23}],
22: [function(_require, module, exports) {

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

}, {}],
23: [function(_require, module, exports) {

/**
 * Module Dependencies
 */

var expr;
try {
  expr = _require('props');
} catch(e) {
  expr = _require('component-props');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  };
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  };
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {};
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key]);
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  };
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val, i, prop;
  for (i = 0; i < props.length; i++) {
    prop = props[i];
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";

    // mimic negative lookbehind to avoid problems with nested properties
    str = stripNested(prop, str, val);
  }

  return str;
}

/**
 * Mimic negative lookbehind to avoid problems with nested properties.
 *
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
 *
 * @param {String} prop
 * @param {String} str
 * @param {String} val
 * @return {String}
 * @api private
 */

function stripNested (prop, str, val) {
  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
    return $1 ? $0 : val;
  });
}

}, {"props":24,"component-props":24}],
24: [function(_require, module, exports) {
/**
 * Global Names
 */

var globals = /\b(this|Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[$a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

}, {}],
13: [function(_require, module, exports) {

/**
 * Module dependencies
 */

var loop = _require('./loop');
var Emitter = _require('component/emitter');

/**
 * Expose `Scene`
 *
 * @type {Function}
 */

module.exports = Scene;

/**
 * A scene renders a component tree to an element
 * and manages the lifecycle and events each frame.
 *
 * @param {HTMLElement} container
 * @param {Entity} entity
 */

function Scene(renderer, entity) {
  this.tick = this.update.bind(this);
  this.renderer = renderer;
  this.dirty = true;
  this.entity = entity;
  entity.addToScene(this);
  this.update();
  this.resume();
}

Emitter(Scene.prototype);

/**
 * Schedule this component to be updated on the next frame.
 *
 * @param {Function} done
 * @return {void}
 */

Scene.prototype.update = function(){
  if (!this.dirty) return;
  this.dirty = false;
  this.renderer.render(this.entity);
  this.emit('update');
};

/**
 * Set new props on the component and trigger a re-render.
 *
 * @param {Object} newProps
 * @param {Function} [done]
 */

Scene.prototype.setProps = function(newProps, done){
  if (done) this.once('update', done);
  this.entity.setProps(newProps);

  // Return a promise if the environment
  // supports the native version.
  var self = this;
  if (typeof Promise !== 'undefined') {
    return new Promise(function(resolve){
      self.once('update', function(){
        resolve();
      });
    });
  }
};

/**
 * Replace all the props on the current entity
 *
 * @param {Objct} newProps
 * @param {Function} done
 *
 * @return {Promise}
 */

Scene.prototype.replaceProps = function(newProps, done){
  if (done) this.once('update', done);
  this.entity.replaceProps(newProps);

  // Return a promise if the environment
  // supports the native version.
  var self = this;
  if (typeof Promise !== 'undefined') {
    return new Promise(function(resolve){
      self.once('update', function(){
        resolve();
      });
    });
  }
};

/**
 * Remove the scene from the DOM.
 */

Scene.prototype.remove = function(){
  this.pause();
  this.renderer.clear();
};

/**
 * Resume updating the scene
 */

Scene.prototype.resume = function(){
  loop.on('tick', this.tick);
};

/**
 * Stop updating the scene
 */

Scene.prototype.pause = function(){
  loop.off('tick', this.tick);
};
}, {"./loop":25,"component/emitter":6}],
25: [function(_require, module, exports) {

/**
 * Module dependecies
 */

var raf = _require('component/raf');
var Emitter = _require('component/emitter');

/**
 * Singleton emitter
 */

var frames = new Emitter();

/**
 * Emit an event on each frame
 */

function tick(timestamp){
  frames.emit('tick', timestamp);
  raf(tick);
}

/**
 * Start the loop
 */

raf(tick);

/**
 * Export `Loop`
 */

module.exports = frames;
}, {"component/raf":26,"component/emitter":6}],
26: [function(_require, module, exports) {
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

}, {}],
14: [function(_require, module, exports) {

/**
 * Dependencies.
 */

var Interactions = _require('./interactions');
var each = _require('component/each');
var patch = _require('./diff');

/**
 * Export.
 */

module.exports = HTMLRenderer;

/**
 * Handles the rendering of a scene graph by running
 * diffs on the current virtual tree of the entities with
 * the previous version. It then applies this diff to the
 * acutal DOM tree.
 *
 * Instead of using SceneNodes or some other object type, we're
 * just using the entities themselves, since each SceneNode can only
 * have a single entity anyway. In the future we could split these up, but
 * it seems simpler to do it this way for now.
 */

function HTMLRenderer(container) {
  this.container = container;
  this.events = new Interactions(container);
  this.elements = {};
  this.rendered = null;
}

/**
 * Render an entity tree. This should be called on the top
 * level entity that is mounted to the container.
 *
 * @param {Entity} entity
 *
 * @api public
 */

HTMLRenderer.prototype.render = function(entity) {

  // We're rendering a new entity to the scene.
  if (this.rendered !== entity) {
    this.clear();
    this.mountEntity(entity, this.container);
    this.rendered = entity;
    return;
  }

  this.update(entity);
};

/**
 * Update an entity already on the scene.
 *
 * @param {Entity} entity
 *
 * @api private
 * @return {void}
 */

HTMLRenderer.prototype.update = function(entity) {

  // Does this entity even need updating?
  if (!entity.dirty) {
    return this.updateChildren(entity);
  }

  var previousState = entity.state;
  var previousProps = entity.props;
  var updated = entity.update();

  // TODO: Use an event to call all of this.
  // This will allow us to call of the lifecycle
  // events from within the entity.

  // The props/state were the same
  if (!updated) {
    return this.updateChildren(entity);
  }

  var nextTree = entity.render();

  // Run the diff and patch the element.
  patch(entity, nextTree, this.getElement(entity.id), this);

  // Commit the changes.
  entity.setCurrent(nextTree);
  this.updateEvents(entity);
  this.updateChildren(entity);
  entity.afterUpdate(previousState, previousProps);
};

/**
 * Update all the children of an entity
 *
 * @param {Entity} entity
 */

HTMLRenderer.prototype.updateChildren = function(entity) {
  for (var key in entity.children) {
    this.update(entity.children[key]);
  }
};

/**
 * Clear the scene
 *
 * @return {void}
 */

HTMLRenderer.prototype.clear = function(){
  if (!this.rendered) return;
  this.unmountEntity(this.rendered);
  this.rendered = null;
};

/**
 * Append an entity to an element
 *
 * @param {Entity} entity
 * @param {HTMLElement} container
 *
 * @return {HTMLElement}
 */

HTMLRenderer.prototype.mountEntity = function(entity, container) {
  var el = this.addEntity(entity, container);
  entity.beforeMount();
  container.appendChild(el);
  this.updateEvents(entity);
  entity.afterMount(el);
  return el;
};

/**
 * Remove the entity from the DOM.
 *
 * @param {Entity} entity
 */

HTMLRenderer.prototype.unmountEntity = function(entity){
  var el = this.getElement(entity.id);

  // This entity is already unmounted
  if (!el) return;

  entity.beforeUnmount(el);

  // If sub-components are on the root node, the entities will share
  // the same element. In this case, the element will only need to be
  // removed from the DOM once
  if (el.parentNode) el.parentNode.removeChild(el);
  this.unmountChildren(entity);
  this.removeEvents(entity);
  entity.afterUnmount();
  entity.remove();
  delete this.elements[entity.id];
};

/**
 * Remove all of the child entities of an entity
 *
 * @param {Entity} entity
 */

HTMLRenderer.prototype.unmountChildren = function(entity) {
  var self = this;
  each(entity.children, function(path, child){
    entity.removeChild(path);
    self.unmountEntity(child);
  });
};

/**
 * Get the element for an entity using the entity ID
 *
 * @param {String} id
 *
 * @return {HTMLElement}
 */

HTMLRenderer.prototype.getElement = function(id) {
  return this.elements[id];
};

/**
 * Updates all the DOM event bindings for an entity.
 * It removes all event bindings on the scene for this entity
 * first and just reapplies them using the current tree.
 *
 * @return {void}
 */

HTMLRenderer.prototype.updateEvents = function(entity) {
  var self = this;
  this.events.unbind(entity.id);

  // TODO: Optimize this by storing the events in the Tree
  // object on the initial pass instead of looping again.
  // eg. entity.current.events -> '0.0.1:click': fn
  each(entity.current.nodes, function(path, node){
    if (node.type !== 'element') return;
    each(node.events, function(eventType, fn){
      self.events.bind(entity.id, path, eventType, function(e){
        fn.call(entity.component, e, entity.props, entity.state);
      });
    });
  });
};

/**
 * Unbind all events from an entity
 *
 * @param {Entity} entity
 */

HTMLRenderer.prototype.removeEvents = function(entity) {
  this.events.unbind(entity.id);
};

/**
 * Render an entity as a HTML element
 *
 * @param {Entity} entity
 *
 * @return {HTMLElement}
 */

HTMLRenderer.prototype.addEntity = function(entity, parentEl) {
  var el = this.createElement(entity.current.root, entity.current, entity, parentEl);
  this.elements[entity.id] = el;
  // entity.on('update', this.updateEntity);
  // entity.on('remove', this.unmountEntity);
  return el;
};

/**
 * Convert this node and all it's children into
 * real DOM elements and return it.
 *
 * Passing in a node allows us to render just a small
 * part of the tree instead of the whole thing, like when
 * a new branch is added during a diff.
 *
 * @param {Node} node
 * @param {Tree} tree
 * @param {Entity} entity
 * @param {HTMLElement} parentEl
 *
 * @return {HTMLElement}
 */

HTMLRenderer.prototype.createElement = function(node, tree, entity, optParentEl){
  var path = tree.getPath(node);
  var parentEl = optParentEl || document.createDocumentFragment();

  // we can only render nodes that exist within the tree.
  if (!path) throw new Error('Node does not exist in the entity');

  if (node.type === 'text') {
    parentEl.appendChild(document.createTextNode(node.data));
    return parentEl;
  }

  if (node.type === 'element') {
    var el = document.createElement(node.tagName);
    var children = node.children;

    for (var name in node.attributes) {
      el.setAttribute(name, node.attributes[name]);
    }

    // store the path for event delegation.
    el.__path__ = path;
    el.__entity__ = entity.id;

    // add children.
    for (var i = 0, n = children.length; i < n; i++) {
      this.createElement(children[i], tree, entity, el);
    }

    // TODO: Store nodes in a hash so we can easily find
    // elements later. This would allow us to separate out the
    // patching from the diffing will still being efficient. We could
    // also use the same object in the Interactions object to make
    // lookups cleaner instead of checking __ values.
    // this.nodesByPath[entity.id][path] = el;

    parentEl.appendChild(el);
    return el;
  }

  if (node.type === 'component') {
    var child = entity.addChild(path, node.component, node.props);
    return this.mountEntity(child, parentEl);
  }
};

}, {"./interactions":27,"component/each":20,"./diff":28}],
27: [function(_require, module, exports) {

var delegate = _require('component/delegate');
var throttle = _require('component/per-frame');
var keypath = _require('./keypath');

/**
 * All of the events we will bind to
 */

var events = [
  'blur',
  'change',
  'click',
  'contextmenu',
  'copy',
  'cut',
  'dblclick',
  'drag',
  'dragend',
  'dragenter',
  'dragexit',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  'focus',
  'input',
  'keydown',
  'keyup',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'paste',
  'scroll',
  'submit',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'wheel'
];

/**
 * Expose `Interactions`.
 */

module.exports = Interactions;

/**
 * Handle events for a component.
 *
 * @param {HTMLElement} el
 */

function Interactions(el) {
  this.el = el;
  this.handlers = {};
  this.handle = handle.bind(this);
  this.resume();
}

/**
 * Bind events for an element, and all it's rendered child elements.
 *
 * @param {String} path
 * @param {String} event
 * @param {Function} fn
 */

Interactions.prototype.bind = function(namespace, path, event, fn){
  keypath.set(this.handlers, [namespace, path, event], throttle(fn));
};

/**
 * Unbind events for a namespace
 *
 * @param {String} namespace
 */

Interactions.prototype.unbind = function(namespace){
  delete this.handlers[namespace];
};

/**
 * Start listening for events
 */

Interactions.prototype.resume = function(){
  events.forEach(function(name){
    this.el.addEventListener(name, this.handle, true);
  }, this);
};

/**
 * Stop listening for events
 */

Interactions.prototype.pause = function(){
  events.forEach(function(name){
    this.el.removeEventListener(name, this.handle);
  }, this);
};

/**
 * After render, finally bind event listeners.
 */

Interactions.prototype.remove = function(){
  this.handlers = {};
  this.pause();
};

/**
 * Handle an event that has occured within the container
 *
 * @param {Event} event
 */

function handle(event){
  var target = event.target;
  var handlers = this.handlers;
  var fn = keypath.get(this.handlers, [target.__entity__, target.__path__, event.type]);
  if (fn) {
    fn(event);
  }
}
}, {"component/delegate":29,"component/per-frame":30,"./keypath":31}],
29: [function(_require, module, exports) {
/**
 * Module dependencies.
 */

var closest = _require('closest')
  , event = _require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

}, {"closest":32,"event":33}],
32: [function(_require, module, exports) {
var matches = _require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return
  }
}

}, {"matches-selector":34}],
34: [function(_require, module, exports) {
/**
 * Module dependencies.
 */

var query = _require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

}, {"query":35}],
35: [function(_require, module, exports) {
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

}, {}],
33: [function(_require, module, exports) {
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
}, {}],
30: [function(_require, module, exports) {
/**
 * Module Dependencies.
 */

var raf = _require('raf');

/**
 * Export `throttle`.
 */

module.exports = throttle;

/**
 * Executes a function at most once per animation frame. Kind of like
 * throttle, but it throttles at ~60Hz.
 *
 * @param {Function} fn - the Function to throttle once per animation frame
 * @return {Function}
 * @public
 */

function throttle(fn) {
  var rtn;
  var ignoring = false;

  return function queue() {
    if (ignoring) return rtn;
    ignoring = true;

    raf(function() {
      ignoring = false;
    });

    rtn = fn.apply(this, arguments);
    return rtn;
  };
}

}, {"raf":36}],
36: [function(_require, module, exports) {
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

}, {}],
31: [function(_require, module, exports) {
exports.get = function(obj, path) {
  var parts = path;
  var value = obj;
  while(parts.length) {
    var part = parts.shift();
    value = value[part];
    if(value === undefined) parts.length = 0;
  }
  return value;
};

exports.set = function(obj, path, value) {
  var parts = path;
  var target = obj;
  var last = parts.pop();
  while(parts.length) {
    var part = parts.shift();
    if(!target[part]) target[part] = {};
    target = target[part];
  }
  target[last] = value;
};

}, {}],
28: [function(_require, module, exports) {

var equals = _require('jkroso/equals');

module.exports = patch;

/**
 * Create a patch function from a diff.
 *
 * @param {ComponentRenderer} this The this component
 */

function patch(entity, nextTree, el, renderer){
  diffNode(entity.current.root, nextTree.root, {
    entity: entity,
    nextTree: nextTree,
    renderer: renderer,
    el: el,
    path: '0',
    id: entity.id,
    isRoot: true
  });
}

/**
 * Create a diff between two tress of nodes.
 */

 function diffNode(current, next, context){
  // Type changed. This could be from element->text, text->ComponentA,
  // ComponentA->ComponentB etc. But NOT div->span. These are the same type
  // (ElementNode) but different tag name.
  if (current.type !== next.type) {
    return replaceNode(current, next, context);
  }

  // update the text content.
  if (next.type === 'text') {
    return diffText(current, next, context);
  }

  // update nested components.
  if (next.type === 'component') {
    return diffComponent(current, next, context);
  }

  // if they are both elements.
  if (next.type === 'element') {
    return diffElement(current, next, context);
  }
}

/**
 * Diff two text nodes and update the element.
 *
 * @param {Node} previous
 * @param {Node} current
 * @param {TextElement} el
 */

function diffText(previous, current, context){
  if (current.data !== previous.data) {
    context.el.data = current.data;
  }
}

/**
 * Diff the children of an ElementNode.
 *
 * @param {ComponentRenderer} this
 * @param {Node} previous
 * @param {Node} current
 * @param {Element} el
 */

function diffChildren(previous, current, context){
  var children = zip(previous.children, current.children);
  var el = context.el;

  var j = -1;
  for (var i = 0; i < children.length; i++) {
    j += 1;
    var item = children[i];
    var left = item[0];
    var right = item[1];

    // this is a new node.
    if (left == null) {
      context.renderer.createElement(right, context.nextTree, context.entity, el);
      continue;
    }

    // the node has been removed.
    if (right == null) {
      removeComponents(left, context);
      if ('component' != left.type) {
        el.removeChild(el.childNodes[j]);
      }
      j = j - 1;
      continue;
    }

    diffNode(left, right, {
      el: el.childNodes[j],
      entity: context.entity,
      nextTree: context.nextTree,
      renderer: context.renderer,
      isRoot: false,
      path: context.path + '.' + j
    });
  }
}

/**
 * Diff the attributes and add/remove them.
 *
 * @param {ComponentRenderer} this
 * @param {Node} previous
 * @param {Node} current
 * @param {Element} el
 */

function diffAttributes(previous, current, context){
  var currentAttrs = current.attributes;
  var previousAttrs = previous.attributes;

  // add new attrs
  for (var name in currentAttrs) {
    var value = currentAttrs[name];
    if (!previousAttrs[name] || previousAttrs[name] !== value) {
      context.el.setAttribute(name, value);
    }
  }

  // remove old attrs
  for (var oldName in previousAttrs) {
    if (!currentAttrs[oldName]) {
      context.el.removeAttribute(oldName);
    }
  }
}

/**
 * Update a component with the props from the current node.
 *
 * @param {Node} previous
 * @param {Node} current
 * @param {Object} context
 */

function diffComponent(previous, current, context){
  // if the component type has changed, remove the
  // component and create the new one.
  if (current.component !== previous.component) {
    return replaceNode(previous, current, context);
  }

  var entity = context.entity.getChild(context.path);

  // The props are different, replace them
  // if (!equals(current.props, entity.props)) {
  //   entity.replaceProps(current.props);
  // }

  entity.replaceProps(current.props);
}

/**
 * Diff two element nodes.
 *
 * @param {ComponentRenderer} this
 * @param {Node} previous
 * @param {Node} current
 * @param {Element} el
 */

function diffElement(previous, current, context){
  // different node, so swap them. If the root node of the component has changed it's
  // type we need to update this to point to this new element
  if (current.tagName !== previous.tagName) {
    return replaceNode(previous, current, context);
  }

  // TODO:
  // Order the children using the key attribute in
  // both arrays of children and compare them first, then
  // the other nodes that have been added or removed, then
  // render them in the correct order

  // Add/remove attributes
  diffAttributes(previous, current, context);

  // Recursive
  diffChildren(previous, current, context);
}

/**
 * Replace a node in the previous tree with the node
 * in another tree. It will remove all the components
 * beneath that node and create all new components within
 * the current node and assign them to this this.
 *
 * @param {Node} previous
 * @param {Node} current
 */

function replaceNode(current, next, context){
  var el = context.el;
  var container = el.parentNode;
  removeComponents(current, context);
  // Check for parent node in case child root node is a component
  if (el.parentNode) el.parentNode.removeChild(el);
  var newEl = context.renderer.createElement(next, context.nextTree, context.entity);
  container.insertBefore(newEl, container.childNodes[current.index]);
}

/**
 * Remove all components within a node.
 *
 * @param {ComponentRenderer} this
 * @param {Node} node
 */

function removeComponents(node, context){
  // remove a child component
  if (node.type === 'component') {
    var path = context.entity.current.getPath(node);
    var child = context.entity.removeChild(path);
    context.renderer.unmountEntity(child);
    return;
  }
  // recursively remove components
  if (node.children) {
    node.children.forEach(function(childNode){
      removeComponents(childNode, context);
    }, this);
  }
}

/**
 * Zip multiple arrays together into one array.
 *
 * @return {Array}
 */

function zip() {
  var args = Array.prototype.slice.call(arguments, 0);
  return args.reduce(function(a, b){
    return a.length > b.length ? a : b;
  }, []).map(function(_, i){
    return args.map(function(arr){
      return arr[i];
    });
  });
}

}, {"jkroso/equals":19}],
8: [function(_require, module, exports) {

/**
 * Module dependencies.
 */

var assign = _require('sindresorhus/object-assign');

/**
 * Set properties on `this.state`.
 *
 * @param {Object} state State to merge with existing state.
 * @param {Function} done
 */

exports.setState = function(state, done){
  this.emit('change', state, done);
};

/**
 * Invalidate the component so that it is updated on the next
 * frame regardless of whether or not the state has changed.
 *
 * This sets a temporary state value that is checked and trigger
 * an update. This special property is removed after the component is
 * updated.
 *
 * @return {void}
 */

exports.invalidate = function(){
  this.emit('change', { __force__: true });
};

/**
 * Default render. Renders a noscript tag by
 * default so nothing shows up in the DOM.
 *
 * @param {node} dom
 * @return {Node}
 */

exports.render = function(){
  return null;
};

/**
 * Return the initial state of the component.
 * This should be overriden.
 *
 * @return {Object}
 */

exports.initialState = function(){
  return {};
};

/**
 * Called before the component is mounted in the DOM. This is
 * also called when rendering the component to a string
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.beforeMount = function(el, state, props){

};

/**
 * Called after the component is mounted in the DOM. This is use
 * for any setup that needs to happen, like starting timers.
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.afterMount = function(el, state, props){

};

/**
 * Called before the component is re-rendered
 *
 * @param {Object} state
 * @param {Object} props
 * @param {Object} nextState
 * @param {Object} nextProps
 *
 * @return {void}
 */

exports.beforeUpdate = function(state, props, nextState, nextProps){

};

/**
 * Called after the component is mounted in the DOM. This is use
 * for any setup that needs to happen, like starting timers.
 *
 * @param {Object} state
 * @param {Object} props
 * @param {Object} prevState
 * @param {Object} prevProps
 *
 * @return {void}
 */

exports.afterUpdate = function(state, props, prevState, prevProps){

};

/**
 * Called before the component is unmounted from the DOM
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.beforeUnmount = function(el, state, props){

};

/**
 * Called after the component is unmounted in the DOM
 *
 * @param {HTMLElement} el The root element for the component
 * @param {Object} state
 * @param {Object} props
 *
 * @return {void}
 */

exports.afterUnmount = function(el, state, props){

};

/**
 * Called after the props have been updated.
 *
 * @param {Object} nextProps
 */

exports.propsChanged = function(nextProps){

};
}, {"sindresorhus/object-assign":4}]}, {}, {"1":""})
);