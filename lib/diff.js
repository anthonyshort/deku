
/**
 * Module dependencies.
 */

var Patch = require('./patch');

/**
 * Expose `diff` as the default.
 */

module.exports = exports = diff;

/**
 * Expose `component`
 */

exports.component = diffComponent;

/**
 * Create a patch function from a diff.
 *
 * @param {Node} prev
 * @param {Node} next
 * @api public
 */

function diff(prev, next) {
  var patch = new Patch;
  diffNode(prev, next, patch);
  return function(el){
    return patch.apply(el);
  };
}

/**
 * Create a diff for a single component.
 *
 * @param {Component} component
 * @param {Patch} [patch]
 * @return {Patch}
 * @api public
 */

function diffComponent(component, patch) {
  patch = patch || new Patch;
  var prev = component.node;
  // TODO: Implement shouldUpdate
  component.update();
  var next = component.node;
  diffNode(prev, next, patch);
  return patch;
}

/**
 * Create a diff between two tress of nodes.
 *
 * @param {Node} prev
 * @param {Node} next
 * @param {Patch} [patch]
 * @return {Patch}
 * @api public
 */

function diffNode(prev, next, patch) {
  patch = patch || new Patch;

  var prevPath = prev.path();

  // the node has been removed.
  if (next == null) {
    patch.add(prevPath, function(el){
      el.parentNode.removeChild(el);
    });
    return;
  }

  // Node type changed
  if (prev.type !== next.type) {
    // removeComponents(prev); // TODO: remove all the components
    patch.add(prevPath, function(el){
      el.parentNode.replaceChild(next.render(), el);
    });
    return;
  }

  // update the text content.
  if (next.isText() && prev.isText()) {
    // TODO: maybe there is a simpler way to represent text?
    // https://github.com/facebook/react/blob/master/src/browser/ReactTextComponent.js#L54
    next.create();
    if (next.instance.data !== prev.instance.data) {
      patch.add(prevPath, function(el){
        el.textContent = next.instance.data;
      });
      return;
    }
  }

  // if they are both components.
  if (next.isComponent() && prev.isComponent()) {
    // they are different components.
    if (next.factory != prev.factory) {
      prev.remove();
      patch.add(prevPath, function(el){
        el.parentNode.replaceChild(next.render(), el);
      });
    } else {
      // they are the same components.
      next.create();
      // transfer the instance over
      // next.instance = prev.instance;
      prev.instance.props = next.instance.props;
      diffComponent(prev.instance, patch);
    }
    return;
  }

  // if they are both elements.
  if (next.isElement() && prev.isElement()) {

    // different node, so swap them.
    if (next.data.tagName !== prev.data.tagName) {
      patch.add(prevPath, function(el){
        el.parentNode.replaceChild(next.render(), el);
      });
      return;
    }

    var nextAttrs = next.data.attributes;
    var prevAttrs = prev.data.attributes;

    // add new props to DOM nodes.
    for (var name in nextAttrs) {
      var value = nextAttrs[name];
      if (!prevAttrs[name] || prevAttrs[name] !== value) {
        patch.add(prevPath, function(el){
          el.setAttribute(name, value);
        });
      }
    }

    // remove old props from DOM nodes.
    for (var name in prevAttrs) {
      if (!nextAttrs[name]) {
        patch.add(prevPath, function(el){
          el.removeAttribute(name);
        });
      }
    }

    // TODO:
    // Order the children using the key attribute in
    // both arrays of children and compare them first, then
    // the other nodes that have been added or removed, then
    // render them in the correct order

    // compare the child nodes.
    var children = zip(prev.children, next.children);

    children.forEach(function(item, index){
      var left = item[0];
      var right = item[1];

      // this is a new node.
      if (left == null) {
        patch.add(next.path(), function(el){
          el.appendChild(right.render());
        });
        return;
      }

      diffNode(left, right, patch);
    });
  }

}

/**
 * Zip multiple arrays together into one array
 *
 * @return {Array}
 */

function zip() {
  var args = Array.prototype.slice.call(arguments, 0);
  return args.reduce(function (a, b) {
    return a.length > b.length ? a : b;
  }, []).map(function (_, i) {
    return args.map(function (arr) {
      return arr[i];
    });
  });
}

/**
 * Destroy all of the components that are
 * in the previous tree
 *
 * @param {Node} node
 */

function removeComponents(node) {
  node.remove();
}