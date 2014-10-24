
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
      patch.add(prevPath, function(el){
        el.parentNode.replaceChild(next.render(), el);
      });
    } else {
      // they are the same components.
      next.create();
      prev.instance.props = next.instance.props;
      diffComponent(prev.instance, patch);
    }
    return;
  }

  // different node, so swap them.
  if (next.tagName !== prev.tagName) {
    patch.add(prevPath, function(el){
      el.parentNode.replaceChild(next.render(), el);
    });
    return;
  }

  // Otherwise we'll just use the same node
  // and just update it's attributes and children

  // add new attributes to DOM nodes.
  for (var name in next.attributes) {
    var value = next.attributes[name];
    if (!prev.attributes[name] || prev.attributes[name] !== value) {
      patch.add(prevPath, function(el){
        el.setAttribute(name, value);
      });
    }
  }

  // remove old attributes from DOM nodes.
  for (var name in prev.attributes) {
    if (!next.attributes[name]) {
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
