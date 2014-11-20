
/**
 * Create a patch function from a diff.
 *
 * @param {ComponentRenderer} rendered The rendered component
 */

module.exports = function(rendered){
  diff(rendered, rendered.previous.root, rendered.current.root, rendered.el);
};

/**
 * Create a diff between two tress of nodes.
 */

function diff(rendered, previous, current, el) {

  // Type changed. This could be from element->text, text->ComponentA,
  // ComponentA->ComponentB etc. But NOT div->span. These are the same type
  // (ElementNode) but different tag name.
  if (previous.type !== current.type) {
    return replaceNode(rendered, previous, current, el);
  }

  // update the text content.
  if (current.type === 'text') {
    return diffText(previous, current, el);
  }

  // Update nested components
  if (current.type === 'component') {
    return diffComponent(rendered, previous, current, el);
  }

  // if they are both elements.
  if (current.type === 'element') {
    return diffElement(rendered, previous, current, el);
  }
}

/**
 * Diff two text nodes and update the element.
 *
 * @param {Node} previous
 * @param {Node} current
 * @param {TextElement} el
 */

function diffText(previous, current, el) {
  if (current.data !== previous.data) {
    el.data = current.data;
  }
}

/**
 * Diff the children of an ElementNode.
 *
 * @param {ComponentRenderer} rendered
 * @param {Node} previous
 * @param {Node} current
 * @param {Element} el
 */

function diffChildren(rendered, previous, current, el) {
  var children = zip(previous.children, current.children);

  children.forEach(function(item, index){
    var left = item[0];
    var right = item[1];

    // this is a new node.
    if (left == null) {
      var newEl = rendered.toElement(right);
      el.appendChild(newEl); // TODO place in the right spot using the index
      return;
    }

    // the node has been removed.
    if (right == null) {
      rendered.removeComponents(left);
      el.parentNode.removeChild(el);
      return;
    }

    diff(rendered, left, right, el.childNodes[index]);
  });
}

/**
 * Diff the attributes and add/remove them.
 *
 * @param {ComponentRenderer} rendered
 * @param {Node} previous
 * @param {Node} current
 * @param {Element} el
 */

function diffAttributes(rendered, previous, current, el) {
  var currentAttrs = current.attributes;
  var previousAttrs = previous.attributes;

  // add new attrs
  for (var name in currentAttrs) {
    var value = currentAttrs[name];
    if (!previousAttrs[name] || previousAttrs[name] !== value) {
      rendered.setAttribute(el, name, value);
    }
  }

  // remove old attrs
  for (var name in previousAttrs) {
    if (!currentAttrs[name]) {
      rendered.removeAttribute(el, name);
    }
  }
}

/**
 * Update a component with the props from the current node.
 *
 * @param {ComponentRenderer} rendered
 * @param {Node} previous
 * @param {Node} current
 */

function diffComponent(rendered, previous, current, el) {

  // if the component type has changed, remove the
  // component and create the new one.
  if (current.component !== previous.component) {
    return replaceNode(rendered, previous, current, el);
  }

  var path = rendered.current.getPath(current);
  var child = rendered.children[path];
  var hasSameElement = child.el === rendered.el;
  child.setProps(current.props);
  child.update();

  // if this child component the root node of another component
  // we should update the elements to match for future diffs
  // TODO figure out if we even need this
  if (hasSameElement) rendered.el = child.el;
}

/**
 * Diff two element nodes.
 *
 * @param {ComponentRenderer} rendered
 * @param {Node} previous
 * @param {Node} current
 * @param {Element} el
 */

function diffElement(rendered, previous, current, el) {

  // different node, so swap them. If the root node of the component has changed it's
  // type we need to update rendered to point to this new element
  if (current.tagName !== previous.tagName) {
    return replaceNode(rendered, previous, current, el);
  }

  // TODO:
  // Order the children using the key attribute in
  // both arrays of children and compare them first, then
  // the other nodes that have been added or removed, then
  // render them in the correct order

  // Add/remove attributes
  diffAttributes(rendered, previous, current, el);

  // Recursive
  diffChildren(rendered, previous, current, el);
}

/**
 * Replace a node in the previous tree with the node
 * in another tree. It will remove all the components
 * beneath that node and create all new components within
 * the current node and assign them to this rendered.
 *
 * @param {Node} previous
 * @param {Node} current
 */

function replaceNode(rendered, previous, current, el) {
  var isRoot = (rendered.previous.root === previous);
  var container = rendered.el.parentNode;

  rendered.removeComponents(previous);
  var newEl = rendered.toElement(current);

  if (isRoot) {
    // It's already been removed using .removeComponents
    if (previous.type === 'component') {
      container.appendChild(newEl);
    } else {
      container.replaceChild(newEl, el);
    }
    rendered.el = newEl;
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
