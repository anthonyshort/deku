var Patch = require('./patch');

/**
 * Create a new Patch object for a DOM node. The patch
 * this is return can be applied to `el` to update it to
 * the current state of vnode
 *
 * @param {VirtualNode} vnode
 * @param {HTMLElement} el
 *
 * @return {Patch}
 */

module.exports = function(current, updated) {
  var patch = new Patch();
  compare(current, updated, patch);
  return function(el){
    patch.apply(el);
  };
};

/**
 * Walk down the virtualnode and add to the
 * patch.
 *
 * @param {VirtualNode} current
 * @param {VirtualNode} updated
 * @param {Patch} patch
 *
 * @return {Patch}
 */

function compare(current, updated, patch) {

  // This is a new node
  if (current == null) {
    patch.add(updated.parent.path(), function(el){
      el.appendChild(updated.toElement());
    });
    return;
  }

  var currentPath = current.node.path();

  // The node has been removed
  if (updated == null) {
    patch.add(currentPath, function(el){
      el.parentNode.removeChild(el);
    });
    return;
  }

  // Different node
  if (updated.type !== current.type) {
    patch.add(currentPath, function(el){
      el.parentNode.replaceChild(updated.toElement(), el);
    });
    return;
  }

  // Otherwise we'll just use the same node
  // and just update it's attributes and children

  // Add new attributes
  for (var name in updated.attributes) {
    var value = updated.attributes[name];
    if (!current.attributes[name] || current.attributes[name] !== value) {
      patch.add(currentPath, function(el){
        el.setAttribute(name, value);
      });
    }
  }

  // Remove old attributes
  for (var name in current.attributes) {
    if (!updated.attributes[name]) {
      patch.add(currentPath, function(el){
        el.removeAttribute(name);
      });
    }
  }

  // TODO:
  // Order the children using the key attribute in
  // both arrays of children and compare them first, then
  // the other nodes that have been added or removed, then
  // render them in the correct order

  // Check for new child nodes
  updated.children.forEach(function(child, index){
    var other = current.children[index];
    compare(other, child, patch);
  });

  // Check for old child nodes
  current.children.forEach(function(child, index){
    var other = updated.children[index];
    compare(child, other, patch);
  });

};