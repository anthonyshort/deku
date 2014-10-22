
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
};

/**
 * Apply this patch to an element.
 *
 * @param {Element} el
 */

Patch.prototype.apply = function(el){
  for (var path in this.changes) {
    var changes = this.changes[path];
    var node = findPath(path, el);
    for (var i = 0; i < changes.length; i++) {
      changes[i](node);
    };
  }
};

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
  while (current.length) {
    node = node.childNodes[current.shift()];
  }
  return node;
}
