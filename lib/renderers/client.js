import forEach from 'fast.js/forEach'
import map from 'fast.js/map'
import reduce from 'fast.js/reduce'
import * as $ from '../helpers/dom'
import * as V from '../helpers/virtual'

const isDev = (process.env.NODE_ENV === 'development')
const noop = function(){}

export default function render (app, container) {
  $.createContainer(container)

  var tree = {
    virtualElement: null,
    nativeElement: null,
    children: {}
  }

  let mount = vnode => {
    tree = patch(tree, tree.virtualElement, vnode, tree.nativeElement, $.appendTo(container))
    tree.virtualElement = vnode
  }

  let unmount = () => {
    $.removeElement(tree.nativeElement)
    tree = {
      ...removeChildren(tree),
      nativeElement: null,
      virtualElement: null
    }
  }

  if (app.element) {
    mount(app.element)
  }

  app.on('unmount', unmount)
  app.on('mount', mount)

  return {
    remove: () => {
      unmount()
      app.off('unmount', unmount)
      app.off('mount', mount)
    }
  }
}

/**
 * Recursively remove an entity and all of it's children calling
 * any hooks along the way.
 */

export function removeEntity (entity) {
  V.trigger(entity.type, 'onDestroy', [entity.props])
  for (var child in entity.children) {
    removeEntity(child)
  }
}

/**
 * Update an entity with a new model. It will re-render and patch
 * it's element then return a new entity.
 */

export function renderEntity (entity, props, effect = noop) {
  let {type, virtualElement, nativeElement} = entity
  V.trigger(entity.type, 'validate', [props])
  let nextElement = V.renderComponent(type, props)

  if (!virtualElement || nextElement !== virtualElement) {
    return patch(entity, virtualElement, nextElement, nativeElement, effect, '0')
  } else {
    return entity
  }
}

/**
 * Remove all of the children for an entity, optionally supplying
 * a path. All children below this path will be removed and a new
 * entity will be returned.
 */

export function removeChildren (entity, path = false) {
  return {
    ...entity,
    children: reduce(entity.children, (acc, child, childPath) => {
      if (!path || childPath === path || V.isWithinPath(path, childPath)) {
        removeEntity(child)
      } else {
        acc[childPath] = child
      }
      return acc
    }, {})
  }
}

/**
 * Create a new element given a virtual element. Returns a new
 * entity with any new components nodes added to it.
 */

export function createBranch (owner, vnode, path, effect = noop) {
  switch (V.nodeType(vnode)) {
    case 'text':
      effect($.createTextElement(vnode))
      return owner
    case 'empty':
      effect($.createElement('noscript'))
      return owner
    case 'element':
      return createElement(owner, vnode, path, effect)
    case 'component':
      let child = renderEntity(createEntity(vnode), V.props(vnode), effect)
      V.trigger(child.type, 'afterMount', [child.props, child.nativeElement])
      return {
        ...owner,
        children: {
          ...owner.children,
          [path]: child
        }
      }
  }
}

/**
 * Create a DOM element from a virtual element.
 */

export function createElement (owner, vnode, path = '0', effect = noop) {
  let el = $.createElement(vnode.type, vnode.attributes)
  let append = $.appendTo(el)
  let createChild = (entity, child, i) => createBranch(entity, child, `${path}.${i}`, append)
  let nextOwner = reduce(vnode.children, createChild, owner)
  effect(el)
  return nextOwner
}

/**
 * Create a new component instance given a virtual node. Pure function that
 * returns a new entity every time.
 */

export function createEntity (vnode) {
  return {
    type: vnode.type,
    nativeElement: null,
    virtualElement: null,
    children: {}
  }
}

/**
 * Patch an element using two vnodes. The owner entity will be updated
 * with any new children returned. Returns a new entity.
 */

export function patch (owner, prev, next, el, effect = noop, path = '0') {
  var nextEntity

  switch (V.patchType(prev, next)) {
    case 'skip':
      nextEntity = owner
      break
    case 'create':
      nextEntity = createBranch(owner, next, path, effect)
      break
    case 'replace':
      nextEntity = createBranch(removeChildren(owner, path), next, path, newEl => {
        if (el) $.replaceElement(el, newEl)
        effect(newEl)
      })
      break
    case 'remove':
      nextEntity = removeChildren(owner, path)
      $.removeElement(el)
      break
    case 'updateElement':
      patchAttributes(prev, next, el)
      nextEntity = patchChildren(owner, prev, next, el, path)
      break
    case 'updateText':
      if (prev !== next) el.data = next || ''
      nextEntity = owner
      break
    case 'updateComponent':
      nextEntity = {
        ...owner,
        children: {
          ...owner.children,
          [path]: renderEntity(owner.children[path], V.props(next), effect)
        }
      }
      break
  }

  if (path === '0') {
    nextEntity.virtualElement = next
  }

  return nextEntity
}

/**
 * Diff and patch the children of two vnodes. Returns a new entity
 * and updates the DOM element as a side-effect.
 */

export function patchChildren (owner, prev, next, parentEl, path) {
  let childNodes = [...parentEl.childNodes]
  let changes = V.diffChildren(prev, next)

  return reduce(changes, (owner, change) => {
    let [oldIndex, newIndex] = change.indexes
    let [leftNode, rightNode] = change.nodes
    let oldEl = childNodes[oldIndex]
    let oldPath = `${path}.${oldIndex}`
    let newPath = `${path}.${newIndex}`

    switch (change.type) {
      case 'moved':
        return patch(owner, leftNode, rightNode, oldEl, $.insertAtIndex(parentEl, newIndex), newPath)
      case 'updated':
        return patch(owner, leftNode, rightNode, oldEl, noop, newPath)
      case 'removed':
        return patch(owner, leftNode, null, oldEl, noop, oldPath)
      case 'created':
        return patch(owner, null, rightNode, undefined, $.insertAtIndex(parentEl, newIndex), newPath)
    }
  }, owner)
}

/**
 * Get the native element for an entity. If an entity has no element this means
 * a component has another component as it's root node, so we walk down until
 * we reach an entity that has one.
 */

export function getNativeElement (entity) {
  if (entity.nativeElement) {
    return entity.nativeElement
  } else {
    return getNativeElement(entity.children[0])
  }
}

/**
 * Patch the attributes of an element given two virtual nodes.
 * Non-pure as it modifies the DOM element as a side-effect.
 */

export function patchAttributes (prev, next, el) {
  forEach(next.attributes, (value, name) => {
    let previousValue = prev.attributes[name]
    let eventType = $.events[name]

    // Value hasn't changed
    if (previousValue === value) {
      return
    }

    // Value is a function
    if (typeof value === 'function' && !events[name]) {
      value = value(el)
    }

    // Value is falsy
    if (value === false || value === null || value === undefined) {
      $.removeAttribute(name, el)
      return
    }

    // Attribute is an event hook
    if (eventType) {
      if (previousValue) {
        $.removeEvent(el, eventType, previousValue)
      }
      $.addEvent(el, eventType, value)
      return
    }

    $.setAttribute(name, value, el)
  })

  // Remove missing attributes
  forEach(prev.attributes, (value, name) => {
    let eventType = $.events[name]

    if (name in next.attributes) {
      return
    }

    if (eventType && value) {
      $.removeEvent(el, eventType, value)
    } else {
      $.removeAttribute(name, el)
    }
  })
}
