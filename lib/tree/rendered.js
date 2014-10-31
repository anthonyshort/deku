var Tree = require('./tree');

/**
 * The rendered tree mounts a tree to a DOM node
 * and performs the diffing when a component within
 * it's tree changes.
 *
 * RenderedTrees can contain nested sets of trees. When
 * reaching a Component in it's tree, it will render it as
 * a nested RenderedTree.
 *
 * @param {Tree} tree
 */

function RenderedTree(tree, container) {
  this.el = null;
  this.tree = tree;
  this.subtrees = [];
  this.container = container;
  mount(this);
}

RenderedTree.prototype.unmount = function(){
  // call unmount on all subtrees
  this.subtrees.forEach(function(tree){
    tree.unmount();
  });

  // remove this element from the container
  this.container.removeChild(this.el);

  // reset the container
  this.el = null;
  this.container = null;
}

/**
 * Render the tree and it's sub-trees
 *
 * @param {RenderedTree} rendered
 */

function render(rendered) {
  var top = rendered.tree.root;
  var subtrees = rendered.subtrees;

  // call mount on all components
  rendered.tree.walk(function(path, node){
    if (node.type === 'component') {
      subtrees.push(new Tree(node, path));
    }
  });
}

/**
 * Mount this tree to a container node. It will treat the
 * first child of this container as the node to diff to
 * current tree to.
 *
 * @param {Element} container
 */

function mount(rendered) {
  if (this.container) rendered.unmount();
  this.container = container;

  var mapping = createMapping(container);
  var rootId = this.root;
  var result = document.createDocumentFragment();

  // Render the element by doing a diff on
  // an empty new node

  // TODO: what if the container already contains pre-rendered html?
  var target = dom();

  // Patch the current element in the container
  var patch = this.tree.diff(target);
  patch.apply(result);

  // Render the node to an element
  this.el = result;
  this.container.appendChild(this.el);
}