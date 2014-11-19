
/**
 * Create a patch function from a diff.
 *
 * @param {Mount} mount The mounted component
 * @param {Tree} next The updated node representation
 */

module.exports = function(mount, nextTree){
  diff(mount, mount.rendered.current, nextTree.root, nextTree, mount.el);
};

/**
 * Create a diff between two tress of nodes.
 */

function diff(mount, current, next, nextTree, el) {

  // Type changed. This could be from element->text, text->ComponentA,
  // ComponentA->ComponentB etc. But NOT div->span. These are the same type
  // (ElementNode) but different tag name.
  if (current.type !== next.type) {
    return replaceNode(mount, current, next, nextTree, el);
  }

  // update the text content.
  if (next.type === 'text') {
    return diffText(current, next, el);
  }

  // Update nested components
  if (next.type === 'component') {
    return diffComponent(mount, current, next, nextTree, el);
  }

  // if they are both elements.
  if (next.type === 'element') {
    return diffElement(mount, current, next, nextTree, el);
  }
}

/**
 * Diff two text nodes and update the element.
 *
 * @param {Node} current
 * @param {Node} next
 * @param {TextElement} el
 */

function diffText(current, next, el) {
  if (next.data !== current.data) {
    el.data = next.data;
  }
}

/**
 * Diff the children of an ElementNode.
 *
 * @param {Mount} mount
 * @param {Node} current
 * @param {Node} next
 * @param {Tree} nextTree
 * @param {Element} el
 */

function diffChildren(mount, current, next, nextTree, el) {
  var children = zip(current.children, next.children);

  children.forEach(function(item, index){
    var left = item[0];
    var right = item[1];

    // this is a new node.
    if (left == null) {
      var newEl = mount.toElement(right, nextTree);
      el.appendChild(newEl); // TODO place in the right spot using the index
      return;
    }

    // the node has been removed.
    if (right == null) {
      mount.removeComponents(left);
      el.parentNode.removeChild(el);
      return;
    }

    diff(mount, left, right, nextTree, el.childNodes[index]);
  });
}

/**
 * Diff the attributes and add/remove them.
 *
 * @param {Mount} mount
 * @param {Node} current
 * @param {Node} next
 * @param {Element} el
 */

function diffAttributes(mount, current, next, el) {
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
}

/**
 * Update a component with the props from the next node.
 *
 * @param {Mount} mount
 * @param {Node} current
 * @param {Node} next
 */

function diffComponent(mount, current, next, nextTree, el) {

  // if the component type has changed, remove the
  // component and create the new one.
  if (next.component !== current.component) {
    return replaceNode(mount, current, next, nextTree, el);
  }

  var child = mount.getChildByNode(current);
  var hasSameElement = child.el === mount.el;
  child.set(next.props);
  // TODO when we add batching this will need to call
  // .render on the component so it updates immediately

  // if this child component the root node of another component
  // we should update the elements to match for future diffs
  // TODO figure out if we even need this
  if (hasSameElement) mount.el = child.el;
}

/**
 * Diff two element nodes.
 *
 * @param {Mount} mount
 * @param {Node} current
 * @param {Node} next
 * @param {Tree} nextTree
 * @param {Element} el
 */

function diffElement(mount, current, next, nextTree, el) {

  // different node, so swap them. If the root node of the component has changed it's
  // type we need to update mount to point to this new element
  if (next.tagName !== current.tagName) {
    return replaceNode(mount, current, next, nextTree, el);
  }

  // TODO:
  // Order the children using the key attribute in
  // both arrays of children and compare them first, then
  // the other nodes that have been added or removed, then
  // render them in the correct order

  // Add/remove attributes
  diffAttributes(mount, current, next, el);

  // Recursive
  diffChildren(mount, current, next, nextTree, el);
}

/**
 * Replace a node in the current tree with the node
 * in another tree. It will remove all the components
 * beneath that node and create all new components within
 * the next node and assign them to this mount.
 *
 * @param {Node} current
 * @param {Node} next
 */

function replaceNode(mount, current, next, nextTree, el) {
  var isRoot = (mount.rendered.current === current);
  var container = mount.el.parentNode;

  mount.removeComponents(current);
  var newEl = mount.toElement(next, nextTree);

  if (isRoot) {
    // It's already been removed using .removeComponents
    if (current.type === 'component') {
      container.appendChild(newEl);
    } else {
      container.replaceChild(newEl, el);
    }
    mount.el = newEl;
  } else {
    el.parentNode.replaceChild(newEl, el);
  }

  return newEl;
}

/**
 * Zip multiple arrays together into one array.
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
