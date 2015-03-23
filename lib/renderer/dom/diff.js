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
    renderer: options.renderer,
    rootEl: options.el,
    el: options.el,
    path: '0'
  };
  diffNode(options.current, options.next, context);
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
      renderer: context.renderer,
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
  removeComponents(current, context, context.path);
  // Check for parent node in case child root node is a component
  if (el.parentNode) el.parentNode.removeChild(el);
  var newEl = context.renderer.createElement(context.entity.id, context.path, next);
  var targetEl = container.childNodes[current.index];
  if (targetEl) {
    container.insertBefore(newEl, targetEl);
  } else {
    container.appendChild(newEl);
  }
  if (context.path === '0') context.rootEl = newEl;
}

/**
 * Remove all components within a node.
 *
 * @param {ComponentRenderer} this
 * @param {Node} node
 */

function removeComponents(node, context, path){
  // remove a child component
  if (node.type === 'component') {
    var parentEntityId = context.entity.id;
    var entityId = context.renderer.children[parentEntityId][path];
    var entity = context.renderer.entities[entityId];
    context.renderer.unmount(entity);
    delete context.renderer.children[parentEntityId][path];
    return;
  }
  // recursively remove components
  if (node.children) {
    node.children.forEach(function(childNode, i){
      removeComponents(childNode, context, path + '.' + i);
    }, this);
  }
}
