
var slice = [].slice;

/**
 * Expose `Patch`.
 */

module.exports = Patch;

/**
 * A patch for a DOM element.
 *
 * We add changes to the patch and then apply the patch to a DOM element.
 *
 * @api public
 */

function Patch() {
  this.changes = {};
}

/**
 * Add a change to this patch.
 *
 * @param {String} path
 * @param {Function} fn
 */

Patch.prototype.add = function(path, fn){
  if (!this.changes[path]) this.changes[path] = [];
  this.changes[path].push(fn);
}

/**
 * Apply this patch to an element.
 *
 * @param {HTMLElement} el
 */

Patch.prototype.apply = function(el){
  for (var path in this.changes) {
    var changes = this.changes[path];
    var node = findPath(path, el);
    for (var i = 0; i < changes.length; i++) {
      changes[i](node);
    };
  }
}

/**
 * Find a node in a tree using a path like '1.1.2'.
 *
 * @param {String} path
 * @param {HTMLElement} el
 * @return {HTMLElement}
 * @api private
 */

function findPath(path, el) {
  if (path === "") return el;
  var current = path.split('.');
  var node = el;
  while (current.length && node) {
    var index = current.shift();
    if (typeof index === 'number') {
      node = node.childNodes[index];
    } else {
      node = findKey(node, index);
    }
  }
  if (!node) {
    throw new Error('Node not found');
  }
  return node;
}

/**
 * Find a child node with a matching key
 *
 * @param {String} key
 * @param {Element} el
 *
 * @return {Element}
 */

function findKey(key, el) {
  var children = slice.apply(el.children);
  var match;
  while (children.length && !match){
    var child = children.pop();
    if (child.getAttribute('key') === key) match = child;
  }
  return match;
}