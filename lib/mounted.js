
/**
 * Mount this tree to a container node. It will treat the
 * first child of this container as the node to diff to
 * current tree to.
 *
 * @param {Element} container
 */

function mount(tree, el) {
  if (tree.el) tree.unmount();
  tree.el = el;
  var virtual = createVirtualFromDOM(el);
  tree.diff(virtual).apply(el);
}