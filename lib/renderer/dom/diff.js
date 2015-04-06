var zip = require('array-zip');

module.exports = patch;

/**
 * Patch an element with the diff from two trees
 *
 * @param {object} options
 */

function patch(options){
  diffNode(options.current, options.next, {
    el: options.el,
    entity: options.entity,
    path: '0',
    renderer: options.renderer
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
    return context.renderer.replaceElement(context.entity.id, context.path, context.el, next);
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
    var childPath = context.path + '.' + j;

    // this is a new node.
    if (left == null) {
      var childEl = context.renderer.createElement(context.entity.id, childPath, right) ;
      el.appendChild(childEl);
      continue;
    }

    // the node has been removed.
    if (right == null) {
      context.renderer.removeElement(context.entity.id, childPath, el.childNodes[j])
      j = j - 1;
      continue;
    }

    diffNode(left, right, {
      el: el.childNodes[j],
      entity: context.entity,
      path: childPath,
      renderer: context.renderer
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
      context.renderer.setAttribute(context.el, name, value);
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
 * Update a component with the props from the current node. If
 * the component type has changed, we'll just remove the old one
 * and replace it with the new component.
 *
 * @param {Node} previous
 * @param {Node} current
 * @param {Object} context
 */

function diffComponent(previous, current, context){
  if (current.component !== previous.component) {
    context.renderer.replaceElement(context.entity.id, context.path, context.el, current);
  } else {
    context.renderer.updateEntity(context.entity.id, context.path, current);
  }
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
    return context.renderer.replaceElement(context.entity.id, context.path, context.el, current);
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
