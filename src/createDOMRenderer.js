import createElement from './createElement'
import {diffNode} from './diff'
import patch from './patch'
import uid from 'uid'

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export function createDOMRenderer (container) {
  let oldVnode = null
  let node = null
  let path = uid()

  let update = (newVnode) => {
    let changes = diffNode(oldVnode, newVnode, path)
    node = changes.reduce(patch, node)
    oldVnode = newVnode
    return node
  }

  let create = (vnode) => {
    node = createElement(vnode, path)
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
