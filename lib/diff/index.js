
/**
 * Create a patch function from a diff.
 *
 * @param {Mount} mount
 * @param {Node} next
 * @api public
 */

module.exports = function(mount, next) {
  diff(mount, mount.component.current, next, mount.el);
}

/**
 * Create a diff between two tress of nodes.
 */

function diff(mount, current, next, el) {

  // Node type changed
  if (current.type !== next.type) {
    // TODO: unmount and destroy all components beneath this node
    // el.parentNode.replaceChild(next.render(), el);
    throw new Error('not implemented');
  }

  // update the text content.
  if (next.type === 'text') {
    if (next.data !== current.data) {
      el.data = next.data;
    }
  }

  // if they are both components.
  if (next.type === 'component') {
    throw new Error('not implemented');
  }

  // if they are both elements.
  if (next.type === 'element') {

    // different node, so swap them.
    if (next.tagName !== current.tagName) {
      // TODO: unmount and destroy all components beneath this node
      // el.parentNode.replaceChild(next.render(), el);
      throw new Error('not implemented');
      return;
    }

    var nextAttrs = next.attributes;
    var currentAttrs = current.attributes;

    // add new attrs
    for (var name in nextAttrs) {
      var value = nextAttrs[name];
      if (!currentAttrs[name] || currentAttrs[name] !== value) {
        el.setAttribute(name, value);
      }
    }

    // remove old attrs
    for (var name in currentAttrs) {
      if (!nextAttrs[name]) {
        el.removeAttribute(name);
      }
    }

    // TODO:
    // Order the children using the key attribute in
    // both arrays of children and compare them first, then
    // the other nodes that have been added or removed, then
    // render them in the correct order

    // compare the child nodes.
    var children = zip(current.children, next.children);

    children.forEach(function(item, index){
      var left = item[0];
      var right = item[1];

      // this is a new node.
      if (left == null) {
        // el.appendChild(right.render());
        throw new Error('not implemented');
      }

      // the node has been removed.
      if (right == null) {
        // TODO: unmount and destroy all components beneath this node
        // el.parentNode.removeChild(el);
        throw new Error('not implemented');
      }

      diff(mount, left, right, el.childNodes[index]);
    });
  }
}

/**
 * Zip multiple arrays together into one array
 *
 * @return {Array}
 */

function zip() {
  var args = Array.prototype.slice.call(arguments, 0);
  return args.reduce(function (a, b) {
    return a.length > b.length ? a : b;
  }, []).map(function (_, i) {
    return args.map(function (arr) {
      return arr[i];
    });
  });
}
