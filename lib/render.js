import isDom from 'is-dom'
import svg from './helpers/svg'
import forEach from 'fast.js/forEach'
import map from 'fast.js/map'
import reduce from 'fast.js/reduce'
import {nodeType, patchType, keyMapReducer, isWithinPath} from './helpers/virtual'
import {setAttribute, removeAttribute} from './helpers/dom'
import {removeAllChildren, appendTo, removeElement} from './helpers/dom'

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
    removeAllChildren(container)
  }

  if (container === document.body) {
    console.warn('Using document.body can conflict with other libraries.')
  }

  /**
   * Update the tree
   */

  let mount = vnode => {
    var {entity, el} = patch(tree, tree.virtualElement, vnode, tree.nativeElement)
    tree = {
      ...entity,
      nativeElement: el,
      virtualElement: vnode
    }
    appendTo(container, tree.nativeElement)
  }

  /**
   * Remove the tree and unmount all components
   */

  let unmount = () => {
    removeElement(tree.nativeElement)
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
  trigger('beforeUnmount', entity)
  return removeComponentChildren(entity)
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
    var rendered = patch(entity, virtualElement, nextElement, nativeElement)
    nativeElement = rendered.el
    entity = rendered.entity
  }

  return {
    ...entity,
    virtualElement: nextElement,
    nativeElement: nativeElement
  }
}

/**
 * Removes all child components at or within a path
 */

function removeComponentChildren (entity, path = false) {
  return {
    ...entity,
    children: reduce(entity.children, (acc, child, childPath) => {
      if (!path || childPath === path || isWithinPath(path, childPath)) {
        removeComponent(child)
      } else {
        acc[path] = child
      }
      return acc
    }, {})
  }
}

/**
 * Create a native element from a virtual element.
 */

function toNative (owner, vnode, path) {
  var type = nodeType(vnode)
  if (type === 'text') {
    return {
      entity: owner,
      nativeElement: document.createTextNode(vnode || '')
    }
  } else if (type === 'empty') {
    return {
      entity: owner,
      nativeElement: document.createElement('noscript')
    }
  } else if (type === 'element') {
    let { entity, nativeElement } = toNativeElement(owner, vnode, path)
    return {
      entity,
      nativeElement
    }
  } else if (type === 'component') {
    let child = toNativeComponent(vnode)
    var entity = {
      ...owner,
      children: {
        ...owner.children,
        [path]: child
      }
    }
    return {
      entity: entity,
      nativeElement: child.nativeElement
    }
  }
}

/**
 * Create a native element from a virtual element.
 */

function toNativeElement (owner, {attributes, type, children}, path = '0') {
  var el = svg.isElement(type) ?
    document.createElementNS(svg.namespace, type) :
    document.createElement(type)

  forEach(attributes, function (value, name) {
    setAttribute(el, name, value)
  })

  owner = reduce(children, (entity = owner, child, i) => {
    var {nativeElement, entity} = toNative(entity, child, `${path}.${i}`)
    if (!nativeElement.parentNode) el.appendChild(nativeElement)
    return entity
  })

  return { entity: owner, nativeElement: el }
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
  let props = { ...vnode.attributes, children: vnode.children }
  let entity = renderComponent(initial, props)
  Object.freeze(entity)
  trigger('afterMount', entity)
  return entity
}

/**
 * Update an entity and element by comparing two virtual elements
 */

function patch (owner, prev, next, el, path = '0') {
  switch (patchType(prev, next)) {
    case 'skip':
      return {entity: owner, el}
    case 'create':
      var {entity, nativeElement} = toNative(owner, next, path)
      return {entity, el: nativeElement}
    case 'replace':
      var {entity, nativeElement} = toNative(removeComponentChildren(owner, path), next, path)
      el.parentNode.replaceChild(nativeElement, el)
      return {entity, el: nativeElement}
    case 'updateElement':
      patchAttributes(prev, next, el)
      var {entity, el} = patchChildren(owner, prev, next, el, path)
      return {entity, el}
    case 'updateText':
      if (prev !== next) el.data = next
      return {entity: owner, el}
    case 'updateComponent':
      var entity = {
        ...owner,
        children: {
          ...owner.children,
          [path]: renderComponent(owner.children[path], { ...next.attributes, children: next.children })
        }
      }
      return {entity, el}
  }
}

/**
 * Patch the children two vnodes
 */

function patchChildren (owner, prev, next, el, path) {
  let positions = []
  let childNodes = [...el.childNodes]
  let prevChildren = reduce(prev.children, keyMapReducer, {})
  let nextChildren = reduce(next.children, keyMapReducer, {})
  let prevKeys = Object.keys(prevChildren)
  let nextKeys = Object.keys(nextChildren)
  let i = 0

  while (prevKeys[i] || nextKeys[i]) {
    let prevKey = prevKeys[i]
    let nextKey = nextKeys[i]
    i++
    if (!nextKey) {
      let leftNode = prevChildren[prevKey]
      let entity = removeComponentChildren(owner, `${path}.${leftNode.index}`)
      removeElement(childNodes[leftNode.index])
      owner = entity
    } else if (!prevKey) {
      let rightNode = nextChildren[nextKey]
      let {entity, nativeElement} = toNative(owner, rightNode.vnode, `${path}.${rightNode.index}`)
      owner = entity
      positions[rightNode.index] = nativeElement
    } else {
      let leftNode = prevChildren[prevKey]
      let rightNode = nextChildren[nextKey]
      let prev = leftNode.vnode
      let next = rightNode.vnode
      let {entity, el} = patch(owner, prev, next, childNodes[leftNode.index], `${path}.${leftNode.index}`)
      owner = entity
      positions[rightNode.index] = el
    }
  }

  // Reposition
  forEach(positions, function (childEl, newPosition) {
    var target = el.childNodes[newPosition]
    if (childEl && childEl !== target) {
      if (target) {
        el.insertBefore(childEl, target)
      } else {
        el.appendChild(childEl)
      }
    }
  })

  return {entity: owner, el}
}

/**
 * Patch the attributes of an element using two vnodes
 */

function patchAttributes (prev, next, el) {
  var nextAttrs = next.attributes
  var prevAttrs = prev.attributes

  forEach(nextAttrs, (value, name) => {
    setAttribute(el, name, value, prevAttrs[name])
  })

  forEach(prevAttrs, (value, name) => {
    if (!(name in nextAttrs)) {
      removeAttribute(el, name, nextAttrs[name], value)
    }
  })
}