
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
  var patches = walk(current, updated, []);
  return function(root){
    patches.forEach(function(patch){
      var newRoot = patch(root);
      if (newRoot) root = newRoot;
    });
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

function walk(current, updated, patches) {

  // Different node
  if (updated.type !== current.type) {
    patches.push(function(el){
      el.parentNode.replaceChild(updated.toElement(), el);
    });
  }

  // Add new attributes
  for (var name in updated.attributes) {
    var value = updated.attributes[name];
    if (!current.attributes[name] || current.attributes[name] !== value) {
      patches.push(function(el){
        el.setAttribute(name, value);
      });
    }
  }

  // Remove old attributes
  for (var name in current.attributes) {
    if (!updated.attributes[name]) {
      patches.push(function(el){
        el.removeAttribute(name);
      });
    }
  }

  return patches;
};