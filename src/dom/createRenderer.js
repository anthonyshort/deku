import {createElement} from './createElement'
import {diffNode} from '../diff'
import {patch} from './patch'
import uid from 'uid'

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export function createDOMRenderer (container, dispatch) {
  let oldVnode = null
  let node = null
  let path = uid()

  let update = (newVnode, context) => {
    let changes = diffNode(oldVnode, newVnode, path)
    node = changes.reduce(patch(dispatch, context), node)
    oldVnode = newVnode
    return node
  }

  let create = (vnode, context) => {
    node = createElement(vnode, path, dispatch, context)
    if (container) container.appendChild(node)
    oldVnode = vnode
    return node
  }

  return (vnode, context = {}) => {
    return node !== null
      ? update(vnode, context)
      : create(vnode, context)
  }
}
