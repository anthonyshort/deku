var zip = require('array-zip');

module.exports = patch;

/**
 * Patch an element with the diff from two trees
 *
 * @param {object} options
 */

function patch(options){
  var context = {
    entity: options.entity,
    currentTree: options.currentTree,
    nextTree: options.nextTree,
    renderer: options.renderer,
    rootEl: options.el,
    el: options.el,
    path: '0',
    id: options.entity.id,
    isRoot: true
  };
  diffNode(options.currentTree.root, options.nextTree.root, context);
  return context.rootEl;
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
    var childPath = context.path + '.' + j;

    // this is a new node.
    if (left == null) {
      var childEl = context.renderer.createElement(right, childPath, context.entity.id);
      el.appendChild(childEl);
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
      id: context.entity.id,
      el: el.childNodes[j],
      entity: context.entity,
      currentTree: context.currentTree,
      nextTree: context.nextTree,
      renderer: context.renderer,
      isRoot: false,
      path: childPath,
      rootEl: context.rootEl
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
      if (name === "value") {
        context.el.value = value;
      } else if (name === "innerHTML") {
        context.el.innerHTML = value;
      } else {
        context.el.setAttribute(name, value);
      }
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

  var parentEntityId = context.entity.id;
  var entityId = context.renderer.children[parentEntityId][context.path];
  var entity = context.renderer.entities[entityId];

  // We always replace the props on the component when composing
  // them. This will trigger a re-render on all children below this
  // point becasue they're always going to have their props replaced.
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
  var newEl = context.renderer.createElement(next, context.path, context.entity.id);
  var targetEl = container.childNodes[current.index];
  if (targetEl) {
    container.insertBefore(newEl, targetEl);
  } else {
    container.appendChild(newEl);
  }
  if (context.isRoot) context.rootEl = newEl;
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
    var parentEntityId = context.entity.id;
    var nodePath = context.currentTree.getPath(node);
    var entityId = context.renderer.children[parentEntityId][nodePath];
    var entity = context.renderer.entities[entityId];
    context.renderer.unmountEntity(entity);
    delete context.renderer.children[parentEntityId][nodePath];
    return;
  }
  // recursively remove components
  if (node.children) {
    node.children.forEach(function(childNode){
      removeComponents(childNode, context);
    }, this);
  }
}
