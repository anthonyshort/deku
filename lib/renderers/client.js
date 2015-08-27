import isDom from 'is-dom'
import forEach from 'fast.js/forEach'
import map from 'fast.js/map'
import reduce from 'fast.js/reduce'
import * as $ from '../helpers/dom'
import * as V from '../helpers/virtual'

export default function render (app, container) {
  var tree = {
    virtualElement: null,
    nativeElement: null,
    children: {}
  }

  if (!isDom(container)) {
    throw new Error('Container element must be a DOM element')
  }

  if (container.children.length > 0) {
    console.info('The container element is not empty. These elements will be removed.')
    $.removeAllChildren(container)
  }

  if (container === document.body) {
    console.warn('Using document.body can conflict with other libraries.')
  }

  /**
   * Update the tree
   */

  let mount = vnode => {
    var {entity, el} = patch(tree, tree.virtualElement, vnode, tree.nativeElement)

    if (!tree.nativeElement) {
      $.appendTo(container, el)
    }

    tree = {
      ...entity,
      nativeElement: el,
      virtualElement: vnode
    }
  }

  /**
   * Remove the tree and unmount all components
   */

  let unmount = () => {
    $.removeElement(tree.nativeElement)
    tree = {
      ...removeComponentChildren(tree),
      nativeElement: null,
      virtualElement: null
    }
  }

  /**
   * Initial render
   */

  if (app.element) {
    mount(app.element)
  }

  /**
   * Listen for updates
   */

  app.on('unmount', unmount)
  app.on('mount', mount)

  /**
   * Teardown the DOM rendering so that it stops
   * rendering and everything can be garbage collected.
   */

  function teardown () {
    unmount()
    app.off('unmount', unmount)
    app.off('mount', mount)
  }

  /**
   * Return an object that lets us completely remove the automatic
   * DOM rendering and export debugging tools.
   */

  return { remove: teardown }
}

/**
 * Remove a component from the native dom.
 *
 * @param {Entity} entity
 */

function removeComponent (entity) {
  if (!entity) return
  trigger('beforeUnmount', entity, [entity.props])
  for (var child in entity.children) {
    removeComponent(child)
  }
}

/**
 * Trigger a hook on a component.
 */

function trigger (name, entity, args = []) {
  var hook = entity.component[name]
  if (typeof hook === 'function') {
    hook(...args)
  }
}

/**
 * Update a component by re-rendering it. If the same vnode
 * is return we can just skip patching the DOM element.
 */

function renderComponent (entity, props) {
  trigger('validate', entity, [props])

  let {component, virtualElement, nativeElement} = entity
  let render = typeof component === 'function' ? component : component.render
  let nextElement = render(props)

  if (nextElement !== virtualElement) {
    let updated = patch(entity, virtualElement, nextElement, nativeElement)
    return {
      ...updated.entity,
      props: props,
      virtualElement: nextElement,
      nativeElement: updated.el
    }
  }

  return entity
}

/**
 * Removes all child components at or within a path
 */

function removeComponentChildren (entity, path = false) {
  return {
    ...entity,
    children: reduce(entity.children, (acc, child, childPath) => {
      if (!path || childPath === path || V.isWithinPath(path, childPath)) {
        removeComponent(child)
      } else {
        acc[childPath] = child
      }
      return acc
    }, {})
  }
}

/**
 * Create a native element from a virtual element.
 */

function toNative (owner, vnode, path) {
  var type = V.nodeType(vnode)
  if (type === 'text') {
    return {
      entity: owner,
      nativeElement: $.createTextElement(vnode)
    }
  } else if (type === 'empty') {
    return {
      entity: owner,
      nativeElement: $.createElement('noscript')
    }
  } else if (type === 'element') {
    let { entity, nativeElement } = toNativeElement(owner, vnode, path)
    return {
      entity,
      nativeElement
    }
  } else if (type === 'component') {
    let child = toNativeComponent(vnode)
    return {
      entity: {
        ...owner,
        children: {
          ...owner.children,
          [path]: child
        }
      },
      nativeElement: child.nativeElement
    }
  }
}

/**
 * Create a native element from a virtual element.
 */

function toNativeElement (owner, vnode, path = '0') {
  let {attributes, type, children} = vnode
  let el = $.createElement(type)

  forEach(attributes, function (value, name) {
    $.setAttribute(el, name, value)
  })

  let newOwner = reduce(children, (entity, child, i) => {
    var {nativeElement, entity} = toNative(entity, child, `${path}.${i}`)
    if (!nativeElement.parentNode) el.appendChild(nativeElement)
    return entity
  }, owner)

  return {
    entity: newOwner,
    nativeElement: el
  }
}

/**
 * Create a native element from a component.
 */

function toNativeComponent (vnode) {
  let initial = {
    component: vnode.type,
    virtualElement: null,
    nativeElement: null,
    children: {}
  }
  let entity = renderComponent(initial, { ...vnode.attributes, children: vnode.children })
  Object.freeze(entity)
  trigger('afterMount', entity, [entity.props])
  return entity
}

/**
 * Update an entity and element by comparing two virtual elements
 */

function patch (owner, prev, next, el, path = '0') {
  switch (V.patchType(prev, next)) {
    case 'skip':
      return {
        entity: owner,
        el
      }
    case 'create':
      var {entity, nativeElement} = toNative(owner, next, path)
      return {
        entity,
        el: nativeElement
      }
    case 'replace':
      var {entity, nativeElement} = toNative(removeComponentChildren(owner, path), next, path)
      el.parentNode.replaceChild(nativeElement, el)
      return {
        entity,
        el: nativeElement
      }
    case 'updateElement':
      patchAttributes(prev, next, el)
      var entity = patchChildren(owner, prev, next, el, path)
      return {
        entity,
        el
      }
    case 'updateText':
      if (prev !== next) el.data = next || ''
      return {
        entity: owner,
        el
      }
    case 'updateComponent':
      return {
        el,
        entity: {
          ...owner,
          children: {
            ...owner.children,
            [path]: renderComponent(owner.children[path], { ...next.attributes, children: next.children })
          }
        }
      }
  }
}

/**
 * Patch the children two vnodes
 */

function patchChildren (owner, prev, next, parentEl, path) {
  let childNodes = [...parentEl.childNodes]
  let changes = V.changes(prev, next)

  forEach(changes, change => {
    let [oldIndex, newIndex] = change.indexes
    let [leftNode, rightNode] = change.nodes
    let oldEl = childNodes[oldIndex]
    let oldPath = `${path}.${oldIndex}`
    let newPath = `${path}.${newIndex}`

    switch (change.type) {
      case 'moved':
      case 'updated':
        var {entity, el} = patch(owner, leftNode, rightNode, oldEl, newPath)
        $.removeElement(oldEl)
        $.insertAtIndex(parentEl, newIndex, el)
        break
      case 'removed':
        var entity = removeComponentChildren(owner, oldPath)
        $.removeElement(oldEl)
        break
      case 'created':
        var {entity, nativeElement} = toNative(owner, rightNode, newPath)
        $.insertAtIndex(parentEl, newIndex, nativeElement)
        break
    }

    owner = entity
  })

  return owner
}

/**
 * Patch the attributes of an element using two vnodes
 */

function patchAttributes (prev, next, el) {
  var nextAttrs = next.attributes
  var prevAttrs = prev.attributes

  forEach(nextAttrs, (value, name) => {
    $.setAttribute(el, name, value, prevAttrs[name])
  })

  forEach(prevAttrs, (value, name) => {
    if (!(name in nextAttrs)) {
      $.removeAttribute(el, name, nextAttrs[name], value)
    }
  })
}