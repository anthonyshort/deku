

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

module.exports = function(vnode, el) {
  var patches = [];
  walk(vnode, el, patches);
  return patches;
};

/**
 * Walk down the virtualnode and add to the
 * patch.
 *
 * @param {VirtualNode} oldNode
 * @param {VirtualNode} newNode
 * @param {Patch} patch
 *
 * @return {Patch}
 */

function walk(oldNode, newNode, patches) {

  if (!newNode) {
    patches.push(function(el){
      el.parentNode.removeChild(el);
    });
  }

  if (newNode.isNode()) {
    if (newNode.isSameType(oldNode)) {
      var props = oldNode.compareProperties(newNode);
      patch.add(new Patch('PROPS', oldNode, newNode, props));
    }
    else {
      patch.add(new Patch('INSERT', oldNode, newNode));
    }
  }

};