import * as dom from '../dom'
import {diffNode} from '../diff'
import {str as adler32} from 'adler-32'

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export function create (container, dispatch, options = {}) {
  let oldVnode = null
  let node = null
  let rootId = options.id || '0'

  let update = (newVnode, context) => {
    let changes = diffNode(oldVnode, newVnode, rootId)
    node = changes.reduce(dom.update(dispatch, context), node)
    oldVnode = newVnode
    return node
  }

  let create = (vnode, context) => {
    node = dom.create(vnode, rootId, dispatch, context)
    if (container) {
      if (container.childNodes.length === 0) {
        container.appendChild(node)
      } else {
        if (container.attributes.checksum) {
          let preRendered = adler32(container.innerHTML)
          let toBeRendered = adler32(node.outerHTML)
          if (preRendered !== toBeRendered) {
            container.innerHTML = ''
            container.appendChild(node)
          }
        }
      }
    }
    oldVnode = vnode
    return node
  }

  return (vnode, context = {}) => {
    return node !== null
      ? update(vnode, context)
      : create(vnode, context)
  }
}
