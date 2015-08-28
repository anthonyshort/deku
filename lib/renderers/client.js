import forEach from 'fast.js/forEach'
import map from 'fast.js/map'
import reduce from 'fast.js/reduce'
import * as $ from '../helpers/dom'
import * as V from '../helpers/virtual'
import isDev from '../helpers/env'

const noop = function(){}

export default function render (app, container) {
  var tree = {
    virtualElement: null,
    nativeElement: null,
    children: {}
  }

  if (!$.isElement(container)) {
    throw new Error('Container element must be a DOM element')
  }

  if (container.children.length > 0) {
    if (isDev) {
      console.info('The container element is not empty. These elements will be removed.')
    }
    $.removeAllChildren(container)
  }

  if (container === document.body) {
    if (isDev) {
      console.warn('Using document.body can conflict with other libraries.')
    }
  }

  let mount = vnode => {
    tree = patch(tree, tree.virtualElement, vnode, tree.nativeElement, $.appendTo(container))
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

function removeEntity (entity) {
  V.trigger(entity.component, 'beforeUnmount', [entity.props])
  for (var child in entity.children) {
    removeEntity(child)
  }
}

function renderEntity (entity, props) {
  V.trigger(entity.component, 'validate', [props])
  let {component, virtualElement, nativeElement} = entity
  let nextElement = V.renderComponent(component, props)
  return nextElement !== virtualElement ?
    patch(entity, virtualElement, nextElement, nativeElement) :
    entity
}

function removeChildren (entity, path = false) {
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

function createBranch (owner, vnode, path, effect = noop) {
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
      return createComponent(owner, vnode, path, effect)
  }
}

function createElement (owner, vnode, path = '0', effect = noop) {
  let el = $.createElement(vnode.type, vnode.attributes)
  let newOwner = reduce(vnode.children, (entity, child, i) => {
    return createBranch(entity, child, `${path}.${i}`, $.appendTo(el))
  }, owner)
  effect(el)
  return newOwner
}

function createEntity (vnode) {
  let initial = {
    component: vnode.type,
    children: {}
  }
  let entity = renderEntity(initial, { ...vnode.attributes, children: vnode.children })
  Object.freeze(entity)
  V.trigger(entity.component, 'afterMount', [entity.props])
  return entity
}

function createComponent (owner, vnode, path, effect = noop) {
  var child = createEntity(vnode)
  effect(child.nativeElement)
  return {
    ...owner,
    children: {
      ...owner.children,
      [path]: child
    }
  }
}

function patch (owner, prev, next, el, path = '0', effect = noop) {
  switch (V.patchType(prev, next)) {
    case 'skip':
      return owner
    case 'create':
      return createBranch(owner, next, path, effect)
    case 'replace':
      return createBranch(removeChildren(owner, path), next, path, newEl => {
        $.replaceElement(el, newEl)
        effect(newEl)
      })
    case 'updateElement':
      patchAttributes(prev, next, el)
      return patchChildren(owner, prev, next, el, path)
    case 'updateText':
      if (prev !== next) el.data = next || ''
      return owner
    case 'updateComponent':
      return {
        ...owner,
        children: {
          ...owner.children,
          [path]: renderEntity(owner.children[path], {
            ...next.attributes,
            children: next.children
          })
        }
      }
  }
}

function patchChildren (owner, prev, next, parentEl, path) {
  let childNodes = [...parentEl.childNodes]
  let changes = V.changes(prev, next)
  return reduce(changes, (owner, change) => {
    let [oldIndex, newIndex] = change.indexes
    let [leftNode, rightNode] = change.nodes
    let oldEl = childNodes[oldIndex]
    let oldPath = `${path}.${oldIndex}`
    let newPath = `${path}.${newIndex}`
    switch (change.type) {
      case 'moved':
      case 'updated':
        return patch(owner, leftNode, rightNode, oldEl, newPath, $.replaceElement(oldEl))
      case 'removed':
        var entity = removeChildren(owner, oldPath)
        $.removeElement(oldEl)
        return entity
      case 'created':
        return createBranch(owner, rightNode, newPath, $.insertAtIndex(parentEl, newIndex))
    }
  }, owner)
}

function patchAttributes (prev, next, el) {
  forEach(next.attributes, $.setAttribute(el, prev.attributes))
  forEach(prev.attributes, $.removeAttribute(el, next.attributes))
}
