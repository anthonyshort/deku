
/**
 * Dependencies.
 */

var Interactions = require('./interactions');
var shallowCopy = require('shallow-copy');
var virtualize = require('virtualize');
var virtualize = require('../../virtualize');
var Entity = require('./entity');
var each = require('component-each');
var Pool = require('dom-pool');
var walk = require('dom-walk');
var patch = require('./diff');
var raf = require('component-raf');
var isDom = require('is-dom');
var tree = virtualize.tree;
var dom = virtualize.node;

/**
 * Render a component to a DOM element
 *
 * @param {Component} Component
 * @param {HTMLElement} container
 * @param {Object} props
 *
 * @return {Scene}
 */

module.exports = function(world){
  setup();

  function setup() {
    world.on('mount component', onmount);
    world.on('update component', update);
  }

  function teardown() {
    world.off('mount component', onmount);
    world.off('update component', update);
  }

  function onmount(data) {
    mount(data.path, data.component, data.properties, data.element);
  }

  function update(path, properties) {
    if ('0' === path) {
      // TODO: only have to handle root for the moment during refactoring.
    }
  }

  function mount(path, component, properties, el) {
    // TODO: for now, since we can only have 1 root element,
    // this is hardcoded to 1 root.
    // this is currently just decoupling world module from entity,
    // initial first step
    world.root = new Entity(component);
    var renderer = new Renderer(world, el);
  }

  return teardown;
};

/**
 * Handles the rendering of a world graph by running
 * diffs on the current virtual tree of the entities with
 * the previous version. It then applies this diff to the
 * acutal DOM tree.
 */

function Renderer(world, container) {
  this.world = world;
  this.events = new Interactions(document.body);
  this.entities = {};
  this.elements = {};
  this.renders = {};
  this.children = {};
  this.pools = {};
  container.appendChild(this.mount(world.root));
}

/**
 * Update the DOM. If the update fails we stop the loop
 * so we don't get errors on every frame.
 *
 * @api public
 */

Renderer.prototype.render = function() {

  // If this is called synchronously we need to
  // cancel any pending future updates
  if (this.frameId) {
    raf.cancel(this.frameId);
  }

  // If the rendering from the previous frame is still going,
  // we'll just wait until the next frame. Ideally renders should
  // not take over 16ms to stay within a single frame, but this should
  // catch it if it does.
  if (this.isRendering) {
    this.frameId = raf(this.render.bind(this));
    return;
  }

  this.isRendering = true;
  this.frameId = 0;
  this.update(this.world.root);
  this.isRendering = false;
};

/**
 * Update an entity already on the world.
 *
 * @param {Entity} entity
 *
 * @api private
 * @return {void}
 */

Renderer.prototype.update = function(entity) {
  var self = this;

  // Recursive update
  function next(){
    self.updateChildren(entity);
  }

  // If setState or setProps have been called we can
  // allow a user-defined check to see if we should update the
  // component. This returns true by default. This allows the user
  // improve the overall performance of their app and avoids hard
  // to track down bugs. We essentially are trading a bit of
  // performance here for user-experience.
  if (!entity.shouldUpdate()) {
    return next();
  }

  // TODO: We really want to just use a different object here
  // whenever the props/state changes so we can just do an equality
  // check to know if we've changed.
  var nextProps = entity._pendingProps;
  var nextState = entity._pendingState;
  var previousState = entity.state;
  var previousProps = entity.props;
  var currentTree = this.renders[entity.id];
  var currentEl = this.elements[entity.id];

  // pre-update. This callback could mutate the
  // state or props just before the render occurs
  entity.beforeUpdate(nextProps, nextState);

  // Now we can commit the state of the entity. All of the
  // pending props and state will now be committed and reflect
  // the actual state of the component.
  entity.commit();

  // Re-render the tree to get an up-to-date representation
  // of the component with the new props/state
  var nextTree = renderEntity(entity);

  // Run the diff and patch the element.
  patch({
    entity: entity,
    current: currentTree,
    next: nextTree,
    el: currentEl,
    renderer: this
  });

  // Update the element for this component in case
  // the root node has changed.
  this.renders[entity.id] = nextTree;
  this.updateEvents(entity);
  next();
  entity.afterUpdate(previousState, previousProps);
};

/**
 * Update all the children of an entity
 *
 * @param {Entity} entity
 */

Renderer.prototype.updateChildren = function(entity) {
  var entities = this.entities;
  var children = this.children[entity.id];
  for (var path in children) {
    var childId = children[path];
    this.update(entities[childId]);
  }
};

/**
 * Clear the world
 */

Renderer.prototype.remove = function(){
  if (!this.world) return;

  // If this is called synchronously we need to
  // cancel any pending future updates
  if (this.frameId) {
    raf.cancel(this.frameId);
    this.frameId = 0;
  }

  // Unmount the root component and take the
  // element with it.
  var id = this.world.root.id;
  this.removeElement(id, '0', this.elements[id]);
  this.unmount(this.world.root);

  // Unbind all the delegated events.
  this.events.remove();

  // Empty the pools so that our elements don't
  // stay in memory accidentally.
  this.pools = {};
  this.world = null;
};

/**
 * Append an entity to an element
 *
 * @param {Entity} entity
 *
 * @return {HTMLElement}
 */

Renderer.prototype.mount = function(entity) {
  var self = this;

  entity.commit();
  entity.beforeMount();

  // This will store all the entities that are children
  // of this entity after it is rendered and mounted.
  this.children[entity.id] = {};
  this.entities[entity.id] = entity;

  // Render the entity and create the initial element for it
  var current = renderEntity(entity);
  var el = this.createElement(entity.id, '0', current);

  // We store the DOM state of the entity within the renderer
  this.elements[entity.id] = el;
  this.renders[entity.id] = current;

  // Whenever setState or setProps is called, we mark the entity
  // as dirty in the renderer. This lets us optimize the re-rendering
  // and skip components that definitely haven't changed.
  entity.on('change', function(){
    if (self.world.options.renderImmediate) {
      self.render();
    } else {
      if (!self.frameId) self.frameId = raf(self.render.bind(self));
    }
  });

  this.updateEvents(entity);
  entity.afterMount(el);
  return el;
};

/**
 * Remove the entity from the DOM.
 *
 * @param {Entity} entity
 */

Renderer.prototype.unmount = function(entity){
  var el = this.elements[entity.id];
  if (!el) return;
  this.unmountChildren(entity);
  entity.beforeUnmount(el);
  this.removeEvents(entity);
  entity.release();
  delete this.elements[entity.id];
  delete this.renders[entity.id];
  delete this.entities[entity.id];
  delete this.children[entity.id];
};

/**
 * Remove all of the child entities of an entity
 *
 * @param {Entity} entity
 */

Renderer.prototype.unmountChildren = function(entity) {
  var self = this;
  var entities = this.entities;
  var children = this.children[entity.id];
  each(children, function(path, childId){
    self.unmount(entities[childId]);
  });
};

/**
 * Updates all the DOM event bindings for an entity.
 * It removes all event bindings on the world for this entity
 * first and just reapplies them using the current tree.
 *
 * @return {void}
 */

Renderer.prototype.updateEvents = function(entity) {
  var self = this;
  this.events.unbind(entity.id);
  var nodes = tree(this.renders[entity.id]).nodes;

  // TODO: Optimize this by storing the events in the Tree
  // object on the initial pass instead of looping again.
  // eg. entity.current.events -> '0.0.1:click': fn
  each(nodes, function(path, node){
    if (node.type !== 'element') return;
    each(node.events, function(eventType, fn){
      self.events.bind(entity.id, path, eventType, function(e){
        fn.call(entity.component, e, entity.props, entity.state);
      });
    });
  });
};

/**
 * Unbind all events from an entity
 *
 * @param {Entity} entity
 */

Renderer.prototype.removeEvents = function(entity) {
  this.events.unbind(entity.id);
};

/**
 * Get the pool for a tagName, creating it if it
 * doesn't exist.
 *
 * @param {String} tagName
 *
 * @return {Pool}
 */

Renderer.prototype.getPool = function(tagName) {
  var pool = this.pools[tagName];
  if (!pool) {
    pool = this.pools[tagName] = new Pool({ tagName: tagName });
  }
  return pool;
};

/**
 * Convert this node and all it's children into
 * real DOM elements and return it.
 *
 * Passing in a node allows us to render just a small
 * part of the tree instead of the whole thing, like when
 * a new branch is added during a diff.
 *
 * @param {Node} node
 * @param {String} path
 * @param {String} entityId
 *
 * @return {HTMLDocumentFragment}
 */

Renderer.prototype.createElement = function(entityId, path, vnode){
  var entity = this.entities[entityId];

  if (vnode.type === 'text') {
    return document.createTextNode(vnode.data);
  }

  if (vnode.type === 'element') {
    var tagName = vnode.tagName;
    var children = vnode.children;
    var el;

    // Get the element from the pool if we can
    if (entity.option('disablePooling')) {
      el = document.createElement(tagName);
    } else {
      var pool = this.getPool(tagName);
      el = pool.pop();
      removeAllChildren(el);
      removeAllAttributes(el);
      if (el.parentNode) el.parentNode.removeChild(el);
    }

    // TODO: These is some duplication here between the diffing.
    // This should be generalized and put into a module somewhere
    // so that it's easier to define special attributes in one spot.
    for (var name in vnode.attributes) {
      this.setAttribute(el, name, vnode.attributes[name]);
    }

    // TODO: Store nodes in a hash so we can easily find
    // elements later. This would allow us to separate out the
    // patching from the diffing will still being efficient. We could
    // also use the same object in the Interactions object to make
    // lookups cleaner instead of checking __ values.
    // this.elementsByPath[entity.id][path] = el;
    el.__path__ = path;
    el.__entity__ = entityId;

    // add children.
    for (var i = 0, n = children.length; i < n; i++) {
      var childEl = this.createElement(entityId, path + '.' + i, children[i]);
      if (!childEl.parentNode) el.appendChild(childEl);
    }

    return el;
  }

  if (vnode.type === 'component') {
    var child = new Entity(vnode.component, vnode.props);
    this.children[entityId][path] = child.id;
    return this.mount(child);
  }
};

/**
 * Removes an element from the DOM and unmounts and components
 * that are within that branch
 *
 * side effects:
 *   - removes element from the DOM
 *   - removes internal references
 *
 * @param {String} entityId
 * @param {String} path
 * @param {HTMLElement} el
 */

Renderer.prototype.removeElement = function(entityId, path, el) {
  var self = this;
  var children = this.children[entityId];
  var entities = shallowCopy(this.entities);
  var entity = entities[entityId];

  // If the path points to a component we should use that
  // components element instead, because it might have moved it.
  if (children[path]) {
    var child = this.entities[children[path]];
    el = this.elements[child.id];
    this.unmount(child);
    delete children[path];
  } else {
    // Just remove the text node
    if (!isElement(el)) return el.parentNode.removeChild(el);

    // Then we need to find any components within this
    // branch and unmount them.
    for (var childPath in children) {
      if (childPath === path || isWithinPath(path, childPath)) {
        this.unmount(entities[children[childPath]]);
        delete children[childPath];
      }
    }
  }

  // Return all of the elements in this node tree to the pool
  // so that the elements can be re-used.
  walk(el, function(node){
    if (!isElement(node)) return;
    var parent = entities[node.__entity__];
    if (!parent || parent.option('disablePooling')) return;
    self.getPool(node.tagName.toLowerCase()).push(node);
  });

  // Remove it from the DOM
  el.parentNode.removeChild(el);
};

/**
 * Replace an element in the DOM. Removing all components
 * within that element and re-rendering the new virtual node.
 *
 * @param {String} entityId
 * @param {String} path
 * @param {HTMLElement} el
 * @param {Object} vnode
 *
 * @return {void}
 */

Renderer.prototype.replaceElement = function(entityId, path, el, vnode) {
  var parent = el.parentNode;
  var index = Array.prototype.indexOf.call(parent.childNodes, el);

  // remove the previous element and all nested components. This
  // needs to happen before we create the new element so we don't
  // get clashes on the component paths.
  this.removeElement(entityId, path, el);

  // then add the new element in there
  var newEl = this.createElement(entityId, path, vnode);
  var target = parent.childNodes[index];

  if (target) {
    parent.insertBefore(newEl, target);
  } else {
    parent.appendChild(newEl);
  }

  // Make sure any component that was referencing the old
  // element as it's element is now referencing the new one.
  for (var id in this.elements) {
    if (this.elements[id] === el) {
      this.elements[id] = newEl;
    }
  }
};

/**
 * Update an entity to match the latest rendered vode. We always
 * replace the props on the component when composing them. This
 * will trigger a re-render on all children below this point.
 *
 * @param {String} entityId
 * @param {String} path
 * @param {Object} vnode
 *
 * @return {void}
 */

Renderer.prototype.updateEntity = function(entityId, path, vnode) {
  var childId = this.children[entityId][path];
  var entity = this.entities[childId];
  entity.replaceProps(vnode.props);
};

/**
 * Set the attribute of an element, performing additional transformations
 * dependning on the attribute name
 *
 * @param {HTMLElement} el
 * @param {String} name
 * @param {String} value
 */

Renderer.prototype.setAttribute = function(el, name, value) {
  if (name === "value") {
    el.value = value;
  } else if (name === "innerHTML") {
    el.innerHTML = value;
  } else {
    el.setAttribute(name, value);
  }
};

/**
 * Render the entity and make sure it returns a node
 *
 * @param {Entity} entity
 *
 * @return {VirtualTree}
 */

function renderEntity(entity) {
  var result = entity.render();
  if (!result) {
    result = dom('noscript');
  }
  return result;
}

/**
 * Checks to see if one tree path is within
 * another tree path. Example:
 *
 * 0.1 vs 0.1.1 = true
 * 0.2 vs 0.3.5 = false
 *
 * @param {String} target
 * @param {String} path
 *
 * @return {Boolean}
 */

function isWithinPath(target, path) {
  return path.indexOf(target + '.') === 0;
}

/**
 * Is the DOM node an element node
 *
 * @param {HTMLElement} el
 *
 * @return {Boolean}
 */

function isElement(el) {
  return !!el.tagName;
}

/**
 * Remove all the attributes from a node
 *
 * @param {HTMLElement} el
 */

function removeAllAttributes(el) {
  for (var i = el.attributes.length - 1; i >= 0; i--) {
    var name = el.attributes[i].name;
    el.removeAttribute(name);
  }
}

/**
 * Remove all the child nodes from an element
 *
 * @param {HTMLElement} el
 */

function removeAllChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}
