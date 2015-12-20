import createElement from './createElement'
import {diffNode} from './diff'
import patch from './patch'

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export function createDOMRenderer (container) {
  let oldVnode = null
  let node = null

  let update = (newVnode) => {
    let changes = diffNode(oldVnode, newVnode)
    node = changes.reduce(patch, node)
    oldVnode = newVnode
    return node
  }

  let create = (vnode) => {
    node = createElement(vnode)
    if (container) container.appendChild(node)
    oldVnode = vnode
    return node
  }

  return (vnode) => {
    return node !== null
      ? update(vnode)
      : create(vnode)
  }
}
