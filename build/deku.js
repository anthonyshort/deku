(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.deku = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _require=="function"&&_require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _require=="function"&&_require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_require,module,exports){
/**
 * Module dependencies.
 */

'use strict';

var Emitter = _require('component-emitter');

/**
 * Expose `scene`.
 */

module.exports = Application;

/**
 * Create a new `Application`.
 *
 * @param {Object} element Optional initial element
 */

function Application(element) {
  if (!(this instanceof Application)) return new Application(element);
  this.options = {};
  this.sources = {};
  this.element = element;
}

/**
 * Mixin `Emitter`.
 */

Emitter(Application.prototype);

/**
 * Add a plugin
 *
 * @param {Function} plugin
 */

Application.prototype.use = function (plugin) {
  plugin(this);
  return this;
};

/**
 * Set an option
 *
 * @param {String} name
 */

Application.prototype.option = function (name, val) {
  this.options[name] = val;
  return this;
};

/**
 * Mount a virtual element.
 *
 * @param {VirtualElement} element
 */

Application.prototype.mount = function (element) {
  this.element = element;
  this.emit('mount', element);
  return this;
};

/**
 * Remove the world. Unmount everything.
 */

Application.prototype.unmount = function () {
  if (!this.element) return;
  this.element = null;
  this.emit('unmount');
  return this;
};

},{"component-emitter":9}],2:[function(_require,module,exports){
'use strict';

var events = _require('./events');
var svg = _require('./svg');

/**
 * Retrieve the nearest 'body' ancestor of the given element or else the root
 * element of the document in which stands the given element.
 *
 * This is necessary if you want to attach the events handler to the correct
 * element and be able to dispatch events in document fragments such as
 * Shadow DOM.
 *
 * @param  {HTMLElement} el The element on which we will render an app.
 * @return {HTMLElement}    The root element on which we will attach the events
 *                          handler.
 */

exports.getRootElement = function (el) {
  while (el.parentElement) {
    if (el.tagName === 'BODY' || !el.parentElement) {
      return el;
    }
    el = el.parentElement;
  }
  return el;
};

/**
 * Set the value property of an element and keep the text selection
 * for input fields.
 *
 * @param {HTMLElement} el
 * @param {String} value
 */

exports.setElementValue = function (el, value) {
  if (el === document.activeElement && exports.canSelectText(el)) {
    var start = el.selectionStart;
    var end = el.selectionEnd;
    el.value = value;
    el.setSelectionRange(start, end);
  } else {
    el.value = value;
  }
};

/**
 * For some reason only certain types of inputs can set the selection range.
 *
 * @param {HTMLElement} el
 *
 * @return {Boolean}
 */

exports.canSelectText = function (el) {
  return el.tagName === 'INPUT' && ['text', 'search', 'password', 'tel', 'url'].indexOf(el.type) > -1;
};

/**
 * Bind events for an element, and all it's rendered child elements.
 *
 * @param {String} path
 * @param {String} event
 * @param {Function} fn
 */

exports.addEvent = function (el, eventType, fn) {
  el.addEventListener(eventType, fn);
};

/**
 * Unbind events for a entityId
 *
 * @param {String} entityId
 */

exports.removeEvent = function (el, eventType, fn) {
  el.removeEventListener(eventType, fn);
};

/**
 * Is the DOM node an element node
 *
 * @param {HTMLElement} el
 *
 * @return {Boolean}
 */

exports.isElement = function (el) {
  return !!(el && el.tagName);
};

/**
 * Remove all the child nodes from an element
 *
 * @param {HTMLElement} el
 */

exports.removeAllChildren = function (el) {
  while (el.firstChild) el.removeChild(el.firstChild);
};

/**
 * Remove an element from the DOM
 *
 * @param {HTMLElement} el
 */

exports.removeElement = function (el) {
  if (el.parentNode) el.parentNode.removeChild(el);
};

/**
 * Checks to see if one tree path is within
 * another tree path. Example:
 *
 * 0.1 vs 0.1.1 = true
 * 0.2 vs 0.3.5 = false
 *
 * @param {String} target
 * @param {String} path
 *
 * @return {Boolean}
 */

exports.isWithinPath = function (parent, child) {
  return child.indexOf(parent + '.') === 0;
};

/**
 * Set the attribute of an element, performing additional transformations
 * dependning on the attribute name
 *
 * @param {HTMLElement} el
 * @param {String} name
 * @param {String} value
 */

exports.setAttribute = function (el, name, value, previousValue) {
  if (previousValue === value) {
    return;
  }
  if (typeof value === 'function' && !events[name]) {
    value = value(el);
  }
  if (!value) {
    exports.removeAttribute(el, name, previousValue);
    return;
  }
  if (events[name]) {
    if (previousValue) exports.removeEvent(el, events[name], previousValue);
    exports.addEvent(el, events[name], value);
    return;
  }
  switch (name) {
    case 'checked':
    case 'disabled':
    case 'selected':
      el[name] = true;
      break;
    case 'innerHTML':
      el.innerHTML = value;
      break;
    case 'value':
      exports.setElementValue(el, value);
      break;
    case svg.isAttribute(name):
      el.setAttributeNS(svg.namespace, name, value);
      break;
    default:
      el.setAttribute(name, value);
      break;
  }
};

/**
 * Remove an attribute, performing additional transformations
 * dependning on the attribute name
 *
 * @param {HTMLElement} el
 * @param {String} name
 */

exports.removeAttribute = function (el, name, value) {
  if (events[name] && value) {
    exports.removeEvent(el, events[name], value);
    return;
  }
  switch (name) {
    case 'checked':
    case 'disabled':
    case 'selected':
      el[name] = false;
      break;
    case 'innerHTML':
      el.innerHTML = '';
    case 'value':
      exports.setElementValue(el, null);
      break;
    default:
      el.removeAttribute(name);
      break;
  }
};

exports.insertAtIndex = function (parent, index, el) {
  var target = parent.childNodes[index];
  if (target) {
    parent.insertBefore(el, target);
  } else {
    parent.appendChild(el);
  }
};

exports.appendTo = function (container, el) {
  if (el.parentNode !== container) {
    container.appendChild(el);
  }
};

},{"./events":3,"./svg":8}],3:[function(_require,module,exports){
/**
 * All of the events can bind to
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
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
  onError: 'error',
  onFocus: 'focus',
  onInput: 'input',
  onInvalid: 'invalid',
  onKeyDown: 'keydown',
  onKeyPress: 'keypress',
  onKeyUp: 'keyup',
  onMouseDown: 'mousedown',
  onMouseEnter: 'mouseenter',
  onMouseLeave: 'mouseleave',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
  onPaste: 'paste',
  onReset: 'reset',
  onScroll: 'scroll',
  onSubmit: 'submit',
  onTouchCancel: 'touchcancel',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchStart: 'touchstart',
  onWheel: 'wheel'
};
module.exports = exports['default'];

},{}],4:[function(_require,module,exports){
/**
 * Create the application.
 */

'use strict';

exports.tree = exports.scene = exports.deku = _require('./application');

/**
 * Render scenes to the DOM.
 */

if (typeof document !== 'undefined') {
  exports.render = _require('./render');
}

/**
 * Render scenes to a string
 */

exports.renderString = _require('./stringify');

},{"./application":1,"./render":6,"./stringify":7}],5:[function(_require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = nodeType;
var type = _require('component-type');

/**
 * Returns the type of a virtual node
 *
 * @param  {Object} node
 * @return {String}
 */

function nodeType(node) {
  var v = type(node);
  if (v === 'null' || node === false) return 'empty';
  if (v !== 'object') return 'text';
  if (type(node.type) === 'string') return 'element';
  return 'component';
}

module.exports = exports['default'];

},{"component-type":10}],6:[function(_require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

exports['default'] = render;

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
  } else {
    return Array.from(arr);
  }
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

var _isDom = _require('is-dom');

var _isDom2 = _interopRequireDefault(_isDom);

var _svg = _require('./svg');

var _svg2 = _interopRequireDefault(_svg);

var _fastJsForEach = _require('fast.js/forEach');

var _fastJsForEach2 = _interopRequireDefault(_fastJsForEach);

var _fastJsMap = _require('fast.js/map');

var _fastJsMap2 = _interopRequireDefault(_fastJsMap);

var _fastJsReduce = _require('fast.js/reduce');

var _fastJsReduce2 = _interopRequireDefault(_fastJsReduce);

var _nodeType = _require('./node-type');

var _nodeType2 = _interopRequireDefault(_nodeType);

var _dom = _require('./dom');

function render(app, container) {
  var tree = {
    virtualElement: null,
    nativeElement: null,
    children: {}
  };

  if (!(0, _isDom2['default'])(container)) {
    throw new Error('Container element must be a DOM element');
  }

  if (container.children.length > 0) {
    console.info('The container element is not empty. These elements will be removed.');
    (0, _dom.removeAllChildren)(container);
  }

  if (container === document.body) {
    console.warn('Using document.body can conflict with other libraries.');
  }

  /**
   * Update the tree
   */

  var mount = function mount(vnode) {
    var _patch = patch(tree, tree.virtualElement, vnode, tree.nativeElement);

    var entity = _patch.entity;
    var el = _patch.el;

    tree = _extends({}, entity, {
      nativeElement: el,
      virtualElement: vnode
    });
    (0, _dom.appendTo)(container, tree.nativeElement);
  };

  /**
   * Remove the tree and unmount all components
   */

  var unmount = function unmount() {
    (0, _dom.removeElement)(tree.nativeElement);
    tree = _extends({}, removeComponentChildren(tree), {
      nativeElement: null,
      virtualElement: null
    });
  };

  /**
   * Initial render
   */

  if (app.element) {
    mount(app.element);
  }

  /**
   * Listen for updates
   */

  app.on('unmount', unmount);
  app.on('mount', mount);

  /**
   * Teardown the DOM rendering so that it stops
   * rendering and everything can be garbage collected.
   */

  function teardown() {
    unmount();
    app.off('unmount', unmount);
    app.off('mount', mount);
  }

  /**
   * Return an object that lets us completely remove the automatic
   * DOM rendering and export debugging tools.
   */

  return { remove: teardown };
}

/**
 * Remove a component from the native dom.
 *
 * @param {Entity} entity
 */

function removeComponent(entity) {
  if (!entity) return;
  trigger('beforeUnmount', entity);
  return removeComponentChildren(entity);
}

/**
 * Trigger a hook on a component.
 */

function trigger(name, entity) {
  var args = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

  var hook = entity.component[name];
  if (typeof hook === 'function') {
    hook.apply(undefined, _toConsumableArray(args));
  }
}

/**
 * Update a component by re-rendering it. If the same vnode
 * is return we can just skip patching the DOM element.
 */

function renderComponent(entity, props) {
  trigger('validate', entity, [props]);

  var _entity = entity;
  var component = _entity.component;
  var virtualElement = _entity.virtualElement;
  var nativeElement = _entity.nativeElement;

  var render = typeof component === 'function' ? component : component.render;
  var nextElement = render(props);

  if (nextElement !== virtualElement) {
    var rendered = patch(entity, virtualElement, nextElement, nativeElement);
    nativeElement = rendered.el;
    entity = rendered.entity;
  }

  return _extends({}, entity, {
    virtualElement: nextElement,
    nativeElement: nativeElement
  });
}

/**
 * Removes all child components at or within a path
 */

function removeComponentChildren(entity) {
  var path = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  return _extends({}, entity, {
    children: (0, _fastJsReduce2['default'])(entity.children, function (acc, child, childPath) {
      if (!path || childPath === path || (0, _dom.isWithinPath)(path, childPath)) {
        removeComponent(child);
      } else {
        acc[path] = child;
      }
      return acc;
    }, {})
  });
}

/**
 * Create a native element from a virtual element.
 */

function toNative(owner, vnode, path) {
  var type = (0, _nodeType2['default'])(vnode);
  if (type === 'text') {
    return {
      entity: owner,
      nativeElement: document.createTextNode(vnode || '')
    };
  } else if (type === 'empty') {
    return {
      entity: owner,
      nativeElement: document.createElement('noscript')
    };
  } else if (type === 'element') {
    var _toNativeElement = toNativeElement(owner, vnode, path);

    var _entity2 = _toNativeElement.entity;
    var nativeElement = _toNativeElement.nativeElement;

    return {
      entity: _entity2,
      nativeElement: nativeElement
    };
  } else if (type === 'component') {
    var child = toNativeComponent(vnode);
    var entity = _extends({}, owner, {
      children: _extends({}, owner.children, _defineProperty({}, path, child))
    });
    return {
      entity: entity,
      nativeElement: child.nativeElement
    };
  }
}

/**
 * Create a native element from a virtual element.
 */

function toNativeElement(owner, _ref) {
  var attributes = _ref.attributes;
  var type = _ref.type;
  var children = _ref.children;
  var path = arguments.length <= 2 || arguments[2] === undefined ? '0' : arguments[2];

  var el = _svg2['default'].isElement(type) ? document.createElementNS(_svg2['default'].namespace, type) : document.createElement(type);

  (0, _fastJsForEach2['default'])(attributes, function (value, name) {
    (0, _dom.setAttribute)(el, name, value);
  });

  owner = (0, _fastJsReduce2['default'])(children, function (entity, child, i) {
    if (entity === undefined) entity = owner;

    var _toNative = toNative(entity, child, path + '.' + i);

    var nativeElement = _toNative.nativeElement;
    var entity = _toNative.entity;

    if (!nativeElement.parentNode) el.appendChild(nativeElement);
    return entity;
  });

  return { entity: owner, nativeElement: el };
}

/**
 * Create a native element from a component.
 */

function toNativeComponent(vnode) {
  var initial = {
    component: vnode.type,
    virtualElement: null,
    nativeElement: null,
    children: {}
  };
  var props = _extends({}, vnode.attributes, { children: vnode.children });
  var entity = renderComponent(initial, props);
  Object.freeze(entity);
  trigger('afterMount', entity);
  return entity;
}

/**
 * Update an entity and element by comparing two virtual elements
 */

function patch(owner, prev, next, el) {
  var path = arguments.length <= 4 || arguments[4] === undefined ? '0' : arguments[4];

  switch (patchType(prev, next)) {
    case 'skip':
      return { entity: owner, el: el };
    case 'create':
      var _toNative2 = toNative(owner, next, path),
          entity = _toNative2.entity,
          nativeElement = _toNative2.nativeElement;

      return { entity: entity, el: nativeElement };
    case 'replace':
      var _toNative3 = toNative(removeComponentChildren(owner, path), next, path),
          entity = _toNative3.entity,
          nativeElement = _toNative3.nativeElement;

      el.parentNode.replaceChild(nativeElement, el);
      return { entity: entity, el: nativeElement };
    case 'updateElement':
      patchAttributes(prev, next, el);

      var _patchChildren = patchChildren(owner, prev, next, el, path),
          entity = _patchChildren.entity,
          el = _patchChildren.el;

      return { entity: entity, el: el };
    case 'updateText':
      if (prev !== next) el.data = next;
      return { entity: owner, el: el };
    case 'updateComponent':
      var entity = _extends({}, owner, {
        children: _extends({}, owner.children, _defineProperty({}, path, renderComponent(owner.children[path], _extends({}, next.attributes, { children: next.children }))))
      });
      return { entity: entity, el: el };
  }
}

/**
 * Given two nodes, determine the type of patch operation
 */

function patchType(left, right) {
  var leftType = (0, _nodeType2['default'])(left);
  var rightType = (0, _nodeType2['default'])(right);
  if (left === right) {
    return 'skip';
  } else if (leftType === 'empty' && rightType !== 'empty') {
    return 'create';
  } else if (leftType !== rightType) {
    return 'replace';
  } else if (rightType === 'text') {
    return 'updateText';
  } else if (rightType === 'empty') {
    return 'skip';
  } else if (left.type !== right.type) {
    return 'replace';
  } else if (rightType === 'element') {
    return 'updateElement';
  } else if (rightType === 'component') {
    return 'updateComponent';
  }
}

/**
 * For reducing an array of vnodes into an object using the key attribute
 */

function keyMapReducer(acc, child, i) {
  if (child && child.attributes && child.attributes.key != null) {
    acc[child.attributes.key] = {
      vnode: child,
      index: i
    };
  } else {
    acc[i] = {
      vnode: child,
      index: i
    };
  }
  return acc;
}

/**
 * Patch the children two vnodes
 */

function patchChildren(owner, prev, next, el, path) {
  var positions = [];
  var childNodes = [].concat(_toConsumableArray(el.childNodes));
  var prevChildren = (0, _fastJsReduce2['default'])(prev.children, keyMapReducer, {});
  var nextChildren = (0, _fastJsReduce2['default'])(next.children, keyMapReducer, {});
  var prevKeys = Object.keys(prevChildren);
  var nextKeys = Object.keys(nextChildren);
  var i = 0;

  while (prevKeys[i] || nextKeys[i]) {
    var prevKey = prevKeys[i];
    var nextKey = nextKeys[i];
    i++;
    if (!nextKey) {
      var leftNode = prevChildren[prevKey];
      var entity = removeComponentChildren(owner, path + '.' + leftNode.index);
      (0, _dom.removeElement)(childNodes[leftNode.index]);
      owner = entity;
    } else if (!prevKey) {
      var rightNode = nextChildren[nextKey];

      var _toNative4 = toNative(owner, rightNode.vnode, path + '.' + rightNode.index);

      var entity = _toNative4.entity;
      var nativeElement = _toNative4.nativeElement;

      owner = entity;
      positions[rightNode.index] = nativeElement;
    } else {
      var leftNode = prevChildren[prevKey];
      var rightNode = nextChildren[nextKey];
      var _prev = leftNode.vnode;
      var _next = rightNode.vnode;

      var _patch2 = patch(owner, _prev, _next, childNodes[leftNode.index], path + '.' + leftNode.index);

      var entity = _patch2.entity;
      var _el = _patch2.el;

      owner = entity;
      positions[rightNode.index] = _el;
    }
  }

  // Reposition
  (0, _fastJsForEach2['default'])(positions, function (childEl, newPosition) {
    var target = el.childNodes[newPosition];
    if (childEl && childEl !== target) {
      if (target) {
        el.insertBefore(childEl, target);
      } else {
        el.appendChild(childEl);
      }
    }
  });

  return { entity: owner, el: el };
}

/**
 * Patch the attributes of an element using two vnodes
 */

function patchAttributes(prev, next, el) {
  var nextAttrs = next.attributes;
  var prevAttrs = prev.attributes;

  (0, _fastJsForEach2['default'])(nextAttrs, function (value, name) {
    (0, _dom.setAttribute)(el, name, value, prevAttrs[name]);
  });

  (0, _fastJsForEach2['default'])(prevAttrs, function (value, name) {
    if (!(name in nextAttrs)) {
      (0, _dom.removeAttribute)(el, name, nextAttrs[name], value);
    }
  });
}
module.exports = exports['default'];

},{"./dom":2,"./node-type":5,"./svg":8,"fast.js/forEach":14,"fast.js/map":17,"fast.js/reduce":21,"is-dom":22}],7:[function(_require,module,exports){
'use strict';

var nodeType = _require('./node-type');
var type = _require('component-type');

/**
 * Expose `stringify`.
 */

module.exports = function (app) {
  if (!app.element) {
    throw new Error('No element mounted');
  }

  /**
   * Render to string.
   *
   * @param {Component} component
   * @param {Object} [props]
   * @return {String}
   */

  function stringify(component, props, children) {
    if (props === undefined) props = {};

    var render = typeof component === 'function' ? component : component.render;
    props.children = children;
    var node = component.render(props);
    return stringifyNode(node, '0');
  }

  /**
   * Render a node to a string
   *
   * @param {Node} node
   * @param {Tree} tree
   *
   * @return {String}
   */

  function stringifyNode(node, path) {
    switch (nodeType(node)) {
      case 'empty':
        return '<noscript />';
      case 'text':
        return node;
      case 'element':
        var children = node.children;
        var attributes = node.attributes;
        var tagName = node.type;
        var innerHTML = attributes.innerHTML;
        var str = '<' + tagName + attrs(attributes) + '>';

        if (innerHTML) {
          str += innerHTML;
        } else {
          for (var i = 0, n = children.length; i < n; i++) {
            str += stringifyNode(children[i], path + '.' + i);
          }
        }

        str += '</' + tagName + '>';
        return str;
      case 'component':
        return stringify(node.type, node.attributes, node.children);
    }

    throw new Error('Invalid type');
  }

  return stringifyNode(app.element, '0');
};

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
    if (key === 'innerHTML') continue;
    if (isValidAttributeValue(value)) str += attr(key, attributes[key]);
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

/**
 * Is a value able to be set a an attribute value?
 *
 * @param {Any} value
 *
 * @return {Boolean}
 */

function isValidAttributeValue(value) {
  var valueType = type(value);
  switch (valueType) {
    case 'string':
    case 'number':
      return true;
    case 'boolean':
      return value;
    default:
      return false;
  }
}

},{"./node-type":5,"component-type":10}],8:[function(_require,module,exports){
'use strict';

module.exports = {
  isElement: _require('is-svg-element').isElement,
  isAttribute: _require('is-svg-attribute'),
  namespace: 'http://www.w3.org/2000/svg'
};

},{"is-svg-attribute":23,"is-svg-element":24}],9:[function(_require,module,exports){

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
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
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
  function on() {
    this.off(event, on);
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
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
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
    , callbacks = this._callbacks['$' + event];

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
  return this._callbacks['$' + event] || [];
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

},{}],10:[function(_require,module,exports){
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

},{}],11:[function(_require,module,exports){
'use strict';

var bindInternal3 = _require('../function/bindInternal3');

/**
 * # For Each
 *
 * A fast `.forEach()` implementation.
 *
 * @param  {Array}    subject     The array (or array-like) to iterate over.
 * @param  {Function} fn          The visitor function.
 * @param  {Object}   thisContext The context for the visitor.
 */
module.exports = function fastForEach (subject, fn, thisContext) {
  var length = subject.length,
      iterator = thisContext !== undefined ? bindInternal3(fn, thisContext) : fn,
      i;
  for (i = 0; i < length; i++) {
    iterator(subject[i], i, subject);
  }
};

},{"../function/bindInternal3":15}],12:[function(_require,module,exports){
'use strict';

var bindInternal3 = _require('../function/bindInternal3');

/**
 * # Map
 *
 * A fast `.map()` implementation.
 *
 * @param  {Array}    subject     The array (or array-like) to map over.
 * @param  {Function} fn          The mapper function.
 * @param  {Object}   thisContext The context for the mapper.
 * @return {Array}                The array containing the results.
 */
module.exports = function fastMap (subject, fn, thisContext) {
  var length = subject.length,
      result = new Array(length),
      iterator = thisContext !== undefined ? bindInternal3(fn, thisContext) : fn,
      i;
  for (i = 0; i < length; i++) {
    result[i] = iterator(subject[i], i, subject);
  }
  return result;
};

},{"../function/bindInternal3":15}],13:[function(_require,module,exports){
'use strict';

var bindInternal4 = _require('../function/bindInternal4');

/**
 * # Reduce
 *
 * A fast `.reduce()` implementation.
 *
 * @param  {Array}    subject      The array (or array-like) to reduce.
 * @param  {Function} fn           The reducer function.
 * @param  {mixed}    initialValue The initial value for the reducer, defaults to subject[0].
 * @param  {Object}   thisContext  The context for the reducer.
 * @return {mixed}                 The final result.
 */
module.exports = function fastReduce (subject, fn, initialValue, thisContext) {
  var length = subject.length,
      iterator = thisContext !== undefined ? bindInternal4(fn, thisContext) : fn,
      i, result;

  if (initialValue === undefined) {
    i = 1;
    result = subject[0];
  }
  else {
    i = 0;
    result = initialValue;
  }

  for (; i < length; i++) {
    result = iterator(result, subject[i], i, subject);
  }

  return result;
};

},{"../function/bindInternal4":16}],14:[function(_require,module,exports){
'use strict';

var forEachArray = _require('./array/forEach'),
    forEachObject = _require('./object/forEach');

/**
 * # ForEach
 *
 * A fast `.forEach()` implementation.
 *
 * @param  {Array|Object} subject     The array or object to iterate over.
 * @param  {Function}     fn          The visitor function.
 * @param  {Object}       thisContext The context for the visitor.
 */
module.exports = function fastForEach (subject, fn, thisContext) {
  if (subject instanceof Array) {
    return forEachArray(subject, fn, thisContext);
  }
  else {
    return forEachObject(subject, fn, thisContext);
  }
};
},{"./array/forEach":11,"./object/forEach":18}],15:[function(_require,module,exports){
'use strict';

/**
 * Internal helper to bind a function known to have 3 arguments
 * to a given context.
 */
module.exports = function bindInternal3 (func, thisContext) {
  return function (a, b, c) {
    return func.call(thisContext, a, b, c);
  };
};

},{}],16:[function(_require,module,exports){
'use strict';

/**
 * Internal helper to bind a function known to have 4 arguments
 * to a given context.
 */
module.exports = function bindInternal4 (func, thisContext) {
  return function (a, b, c, d) {
    return func.call(thisContext, a, b, c, d);
  };
};

},{}],17:[function(_require,module,exports){
'use strict';

var mapArray = _require('./array/map'),
    mapObject = _require('./object/map');

/**
 * # Map
 *
 * A fast `.map()` implementation.
 *
 * @param  {Array|Object} subject     The array or object to map over.
 * @param  {Function}     fn          The mapper function.
 * @param  {Object}       thisContext The context for the mapper.
 * @return {Array|Object}             The array or object containing the results.
 */
module.exports = function fastMap (subject, fn, thisContext) {
  if (subject instanceof Array) {
    return mapArray(subject, fn, thisContext);
  }
  else {
    return mapObject(subject, fn, thisContext);
  }
};
},{"./array/map":12,"./object/map":19}],18:[function(_require,module,exports){
'use strict';

var bindInternal3 = _require('../function/bindInternal3');

/**
 * # For Each
 *
 * A fast object `.forEach()` implementation.
 *
 * @param  {Object}   subject     The object to iterate over.
 * @param  {Function} fn          The visitor function.
 * @param  {Object}   thisContext The context for the visitor.
 */
module.exports = function fastForEachObject (subject, fn, thisContext) {
  var keys = Object.keys(subject),
      length = keys.length,
      iterator = thisContext !== undefined ? bindInternal3(fn, thisContext) : fn,
      key, i;
  for (i = 0; i < length; i++) {
    key = keys[i];
    iterator(subject[key], key, subject);
  }
};

},{"../function/bindInternal3":15}],19:[function(_require,module,exports){
'use strict';

var bindInternal3 = _require('../function/bindInternal3');

/**
 * # Map
 *
 * A fast object `.map()` implementation.
 *
 * @param  {Object}   subject     The object to map over.
 * @param  {Function} fn          The mapper function.
 * @param  {Object}   thisContext The context for the mapper.
 * @return {Object}               The new object containing the results.
 */
module.exports = function fastMapObject (subject, fn, thisContext) {
  var keys = Object.keys(subject),
      length = keys.length,
      result = {},
      iterator = thisContext !== undefined ? bindInternal3(fn, thisContext) : fn,
      i, key;
  for (i = 0; i < length; i++) {
    key = keys[i];
    result[key] = iterator(subject[key], key, subject);
  }
  return result;
};

},{"../function/bindInternal3":15}],20:[function(_require,module,exports){
'use strict';

var bindInternal4 = _require('../function/bindInternal4');

/**
 * # Reduce
 *
 * A fast object `.reduce()` implementation.
 *
 * @param  {Object}   subject      The object to reduce over.
 * @param  {Function} fn           The reducer function.
 * @param  {mixed}    initialValue The initial value for the reducer, defaults to subject[0].
 * @param  {Object}   thisContext  The context for the reducer.
 * @return {mixed}                 The final result.
 */
module.exports = function fastReduceObject (subject, fn, initialValue, thisContext) {
  var keys = Object.keys(subject),
      length = keys.length,
      iterator = thisContext !== undefined ? bindInternal4(fn, thisContext) : fn,
      i, key, result;

  if (initialValue === undefined) {
    i = 1;
    result = subject[keys[0]];
  }
  else {
    i = 0;
    result = initialValue;
  }

  for (; i < length; i++) {
    key = keys[i];
    result = iterator(result, subject[key], key, subject);
  }

  return result;
};

},{"../function/bindInternal4":16}],21:[function(_require,module,exports){
'use strict';

var reduceArray = _require('./array/reduce'),
    reduceObject = _require('./object/reduce');

/**
 * # Reduce
 *
 * A fast `.reduce()` implementation.
 *
 * @param  {Array|Object} subject      The array or object to reduce over.
 * @param  {Function}     fn           The reducer function.
 * @param  {mixed}        initialValue The initial value for the reducer, defaults to subject[0].
 * @param  {Object}       thisContext  The context for the reducer.
 * @return {Array|Object}              The array or object containing the results.
 */
module.exports = function fastReduce (subject, fn, initialValue, thisContext) {
  if (subject instanceof Array) {
    return reduceArray(subject, fn, initialValue, thisContext);
  }
  else {
    return reduceObject(subject, fn, initialValue, thisContext);
  }
};
},{"./array/reduce":13,"./object/reduce":20}],22:[function(_require,module,exports){
/*global window*/

/**
 * Check if object is dom node.
 *
 * @param {Object} val
 * @return {Boolean}
 * @api public
 */

module.exports = function isNode(val){
  if (!val || typeof val !== 'object') return false;
  if (window && 'object' == typeof window.Node) return val instanceof window.Node;
  return 'number' == typeof val.nodeType && 'string' == typeof val.nodeName;
}

},{}],23:[function(_require,module,exports){
/**
 * Supported SVG attributes
 */

exports.attributes = {
  'cx': true,
  'cy': true,
  'd': true,
  'dx': true,
  'dy': true,
  'fill': true,
  'fillOpacity': true,
  'fontFamily': true,
  'fontSize': true,
  'fx': true,
  'fy': true,
  'gradientTransform': true,
  'gradientUnits': true,
  'markerEnd': true,
  'markerMid': true,
  'markerStart': true,
  'offset': true,
  'opacity': true,
  'patternContentUnits': true,
  'patternUnits': true,
  'points': true,
  'preserveAspectRatio': true,
  'r': true,
  'rx': true,
  'ry': true,
  'spreadMethod': true,
  'stopColor': true,
  'stopOpacity': true,
  'stroke': true,
  'strokeDasharray': true,
  'strokeLinecap': true,
  'strokeOpacity': true,
  'strokeWidth': true,
  'textAnchor': true,
  'transform': true,
  'version': true,
  'viewBox': true,
  'x1': true,
  'x2': true,
  'x': true,
  'y1': true,
  'y2': true,
  'y': true
}

/**
 * Are element's attributes SVG?
 *
 * @param {String} attr
 */

module.exports = function (attr) {
  return attr in exports.attributes
}

},{}],24:[function(_require,module,exports){
/**
 * Supported SVG elements
 *
 * @type {Array}
 */

exports.elements = {
  'animate': true,
  'circle': true,
  'defs': true,
  'ellipse': true,
  'g': true,
  'line': true,
  'linearGradient': true,
  'mask': true,
  'path': true,
  'pattern': true,
  'polygon': true,
  'polyline': true,
  'radialGradient': true,
  'rect': true,
  'stop': true,
  'svg': true,
  'text': true,
  'tspan': true
}

/**
 * Is element's namespace SVG?
 *
 * @param {String} name
 */

exports.isElement = function (name) {
  return name in exports.elements
}

},{}]},{},[4])(4)
});