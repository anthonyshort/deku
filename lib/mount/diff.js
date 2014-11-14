
/**
 * Create a patch function from a diff.
 *
 * @param {Mount} mount The mounted component
 * @param {Node} next The updated node representation
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
    mount.removeComponents(current);
    var newEl = mount.toElement(next); // TODO create child components
    el.parentNode.replaceChild(newEl, el);
    return;
  }

  // update the text content.
  if (next.type === 'text') {
    if (next.data !== current.data) {
      el.data = next.data;
    }
    return;
  }

  // if they are both components.
  if (next.type === 'component') {
    var child = mount.getChildByNode(current);
    child.set(next.props);
    // TODO when we add batching this will need to call
    // .render on the component so it updates immediately
    return;
  }

  // if they are both elements.
  if (next.type === 'element') {

    // different node, so swap them.
    // TODO update this so it creates a new element and just moves the attributes
    // and the child nodes over to the new node and swaps them out
    if (next.tagName !== current.tagName) {
      mount.removeComponents(current);
      var newEl = mount.toElement(next);
      el.parentNode.replaceChild(newEl, el);
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
        var newEl = mount.toElement(right);
        el.appendChild(newEl); // TODO place in the right spot using the index
        return;
      }

      // the node has been removed.
      if (right == null) {
        mount.removeComponents(left);
        el.parentNode.removeChild(el);
        return;
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
