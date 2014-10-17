var Patch = require('./patch');
var utils = require('./utils');
var zip = utils.zip;

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

  var currentPath = current.path();

  // The node has been removed
  if (updated == null) {
    patch.add(currentPath, function(el){
      el.parentNode.removeChild(el);
    });
    return;
  }

  // The elements on the nodes
  var currentElement = current.element;
  var updatedElement = updated.element;

  // Update the text content
  if (updatedElement.type === 'text' && currentElement.type === 'text' && currentElement.data !== updatedElement.data) {
    patch.add(currentPath, function(el){
      el.data = updatedElement.data;
    });
    return;
  }

  // Different node
  if (updatedElement.tagName !== currentElement.tagName || updatedElement.tagName !== currentElement.tagName) {
    patch.add(currentPath, function(el){
      el.parentNode.replaceChild(updated.toElement(), el);
    });
    return;
  }

  // Otherwise we'll just use the same node
  // and just update it's attributes and children

  // Add new attributes
  for (var name in updatedElement.attributes) {
    var value = updatedElement.attributes[name];
    if (!currentElement.attributes[name] || currentElement.attributes[name] !== value) {
      patch.add(currentPath, function(el){
        el.setAttribute(name, value);
      });
    }
  }

  // Remove old attributes
  for (var name in currentElement.attributes) {
    if (!updatedElement.attributes[name]) {
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

  // Compare the child nodes
  zip(current.children, updated.children).map(function(item, index){
    compare(item[0], item[1], patch);
  });

};