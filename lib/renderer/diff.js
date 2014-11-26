
/**
 * Create a patch function from a diff.
 *
 * @param {ComponentRenderer} this The this component
 */

exports.diff = function(){
  this.diffNode(this.previous.root, this.current.root, this.el);
};

/**
 * Create a diff between two tress of nodes.
 */

exports.diffNode = function(previous, current, el){

  // Type changed. This could be from element->text, text->ComponentA,
  // ComponentA->ComponentB etc. But NOT div->span. These are the same type
  // (ElementNode) but different tag name.
  if (previous.type !== current.type) {
    return this.replaceNode(previous, current, el);
  }

  // update the text content.
  if (current.type === 'text') {
    return this.diffText(previous, current, el);
  }

  // update nested components.
  if (current.type === 'component') {
    return this.diffComponent(previous, current, el);
  }

  // if they are both elements.
  if (current.type === 'element') {
    return this.diffElement(previous, current, el);
  }
};

/**
 * Diff two text nodes and update the element.
 *
 * @param {Node} previous
 * @param {Node} current
 * @param {TextElement} el
 */

exports.diffText = function(previous, current, el){
  if (current.data !== previous.data) {
    el.data = current.data;
  }
};

/**
 * Diff the children of an ElementNode.
 *
 * @param {ComponentRenderer} this
 * @param {Node} previous
 * @param {Node} current
 * @param {Element} el
 */

exports.diffChildren = function(previous, current, el){
  var children = zip(previous.children, current.children);

  var j = -1;
  for (var i = 0; i < children.length; i++) {
    j += 1;
    var item = children[i];
    var left = item[0];
    var right = item[1];

    // this is a new node.
    if (left == null) {
      var newEl = this.toElement(right);
      el.appendChild(newEl); // TODO place in the right spot using the index
      continue;
    }

    // the node has been removed.
    if (right == null) {
      this.removeComponents(left);
      if ('component' != left.type) {
        el.removeChild(el.childNodes[j]);
      }
      j = j - 1;
      continue;
    }

    this.diffNode(left, right, el.childNodes[j]);
  }
};

/**
 * Diff the attributes and add/remove them.
 *
 * @param {ComponentRenderer} this
 * @param {Node} previous
 * @param {Node} current
 * @param {Element} el
 */

exports.diffAttributes = function(previous, current, el){
  var currentAttrs = current.attributes;
  var previousAttrs = previous.attributes;

  // add new attrs
  for (var name in currentAttrs) {
    var value = currentAttrs[name];
    if (!previousAttrs[name] || previousAttrs[name] !== value) {
      this.setAttribute(el, name, value);
    }
  }

  // remove old attrs
  for (var name in previousAttrs) {
    if (!currentAttrs[name]) {
      this.removeAttribute(el, name);
    }
  }
};

/**
 * Update a component with the props from the current node.
 *
 * @param {ComponentRenderer} this
 * @param {Node} previous
 * @param {Node} current
 */

exports.diffComponent = function(previous, current, el){

  // if the component type has changed, remove the
  // component and create the new one.
  if (current.component !== previous.component) {
    return this.replaceNode(previous, current, el);
  }

  var path = this.current.getPath(current);
  var child = this.children[path];
  var hasSameElement = child.el === this.el;
  child.setProps(current.props);
  child.update();

  // if this child component the root node of another component
  // we should update the elements to match for future diffs
  // TODO figure out if we even need this
  if (hasSameElement) this.el = child.el;
};

/**
 * Diff two element nodes.
 *
 * @param {ComponentRenderer} this
 * @param {Node} previous
 * @param {Node} current
 * @param {Element} el
 */

exports.diffElement = function(previous, current, el){

  // different node, so swap them. If the root node of the component has changed it's
  // type we need to update this to point to this new element
  if (current.tagName !== previous.tagName) {
    return this.replaceNode(previous, current, el);
  }

  // TODO:
  // Order the children using the key attribute in
  // both arrays of children and compare them first, then
  // the other nodes that have been added or removed, then
  // render them in the correct order

  // Add/remove attributes
  this.diffAttributes(previous, current, el);

  // Recursive
  this.diffChildren(previous, current, el);
};

/**
 * Replace a node in the previous tree with the node
 * in another tree. It will remove all the components
 * beneath that node and create all new components within
 * the current node and assign them to this this.
 *
 * @param {Node} previous
 * @param {Node} current
 */

exports.replaceNode = function(previous, current, el){
  var isRoot = (this.previous.root === previous);
  var container = this.el.parentNode;

  this.removeComponents(previous);
  var newEl = this.toElement(current);

  if (isRoot) {
    // It's already been removed using .removeComponents
    if (previous.type === 'component') {
      container.appendChild(newEl);
    } else {
      container.replaceChild(newEl, el);
    }
    this.el = newEl;
  } else {
    el.parentNode.replaceChild(newEl, el);
  }

  return newEl;
};

/**
 * Remove all components within a node.
 *
 * @param {ComponentRenderer} this
 * @param {Node} node
 */

exports.removeComponents = function(node){
  // text nodes can't have children
  if (node.type === 'text') return;

  // remove a child component
  if (node.type === 'component') {
    var path = this.previous.getPath(node);
    this.children[path].remove();
    delete this.children[path];
  }

  // recursively remove components
  if (node.children) {
    node.children.forEach(function(child){
      this.removeComponents(child);
    }, this);
  }
};

/**
 * Zip multiple arrays together into one array.
 *
 * @return {Array}
 */

function zip() {
  var args = Array.prototype.slice.call(arguments, 0);
  return args.reduce(function(a, b){
    return a.length > b.length ? a : b;
  }, []).map(function(_, i){
    return args.map(function(arr){
      return arr[i];
    });
  });
}
