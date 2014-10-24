
/**
 * Module dependencies.
 */

var Patch = require('./patch');
var utils = require('./utils');
var zip = utils.zip;

/**
 * Expose `diff` as the default.
 */

exports = module.exports = diff;

/**
 * Expose `diffNode` as `node`.
 */

exports.node = diffNode;

/**
 * Expose `diffComponent` as `component`.
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

  // this is a new node.
  if (prev == null) {
    patch.add(next.parent.path(), function(el){
      el.appendChild(next.render());
    });
    return;
  }

  var prevPath = prev.path();

  // the node has been removed.
  if (next == null) {
    patch.add(prevPath, function(el){
      el.parentNode.removeChild(el);
    });
    return;
  }

  // the element/component on the node.
  var prevOwner = prev.owner;
  var nextOwner = next.owner;

  // update the text content.
  if (next.isText() && prev.isText() && prevOwner.data !== nextOwner.data) {
    patch.add(prevPath, function(el){
      el.textContent = nextOwner.data;
    });
    return;
  }

  // if they are both components.
  if (next.isComponent() && prev.isComponent()) {
    // TODO: if (nextOwner != prevOwner) {}
    var component = prev.owner;
    component.props = next.owner.props;
    diffComponent(component, patch);
    return;
  }

  // different node, so swap them.
  if (nextOwner.tagName !== prevOwner.tagName || nextOwner.tagName !== prevOwner.tagName) {
    patch.add(prevPath, function(el){
      el.parentNode.replaceChild(next.render(), el);
    });
    return;
  }

  // Otherwise we'll just use the same node
  // and just update it's attributes and children

  // add new attributes to DOM nodes.
  for (var name in nextOwner.attributes) {
    var value = nextOwner.attributes[name];
    if (!prevOwner.attributes[name] || prevOwner.attributes[name] !== value) {
      patch.add(prevPath, function(el){
        el.setAttribute(name, value);
      });
    }
  }

  // remove old attributes from DOM nodes.
  for (var name in prevOwner.attributes) {
    if (!nextOwner.attributes[name]) {
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
  zip(prev.children, next.children)
    .forEach(function(item, index){
      exports.node(item[0], item[1], patch);
    });
}
