import * as dom from '../dom'
import {diffNode} from '../diff'
import noop from '@f/noop'
import empty from '@f/empty-element'

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Can reuse markup inside the container (if any).
 * Returns a function that accepts new state that can replace what is currently rendered.
 */

export function createApp (container, handler = noop, options = {}) {
  let oldVnode = null
  let node = null
  let rootId = options.id || '0'
  let dispatch = effect => effect && handler(effect)

  if (typeof handler != 'function' && typeof handler == 'object') {
    options = handler;
    handler = noop;
  }

  let update = (newVnode, context) => {
    let changes = diffNode(oldVnode, newVnode, rootId)
    node = changes.reduce(dom.updateElement(dispatch, context), node)
    oldVnode = newVnode
    return node
  }

  let create = (vnode, context) => {
    node = dom.createElement(vnode, rootId, dispatch, context)
    if (container) {
      empty(container)
      container.appendChild(node)
    }
    oldVnode = vnode
    return node
  }

  let createWithReuse = (vnode, context) => {
    let {DOMnode, attachEvents} = dom.createElementThenEvents(vnode, rootId, dispatch, context, container.firstChild)
    node = DOMnode
    attachEvents(container.firstChild)
    oldVnode = vnode
    return node
  }

  return (vnode, context = {}) => {
    return node !== null
      ? update(vnode, context)
      : (
        !container || container.childNodes.length === 0 || !options.reuseMarkup
          ? create(vnode, context)
          : createWithReuse(vnode, context)
      )
  }
}
