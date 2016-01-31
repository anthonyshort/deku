import * as dom from '../dom'
import {diffNode} from '../diff'
import empty from '@f/empty-element'
import noop from '@f/noop'
import {str as adler32} from 'adler-32'

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export function createApp (container, handler = noop, options = {}) {
  let oldVnode = null
  let node = null
  let rootId = options.id || '0'
  let dispatch = effect => effect && handler(effect)

  // TODO: требуется ли?
  if (container) {
    empty(container)
  }

  let update = (newVnode, context) => {
    let changes = diffNode(oldVnode, newVnode, rootId)
    node = changes.reduce(dom.updateElement(dispatch, context), node)
    oldVnode = newVnode
    return node
  }

  let create = (vnode, context) => {
    if (container){
      if(container.childNodes.length === 0){
        node = dom.create(vnode, rootId, dispatch, context)
        container.appendChild(node)
      }else{
        let {DOMnode, attachEvents} = dom.createElementThenEvents(vnode, rootId, dispatch, context)
        let isRenderedCorrectly = true
        if(container.attributes.checksum){
          isRenderedCorrectly = container.attributes.checksum ===  adler32(DOMnode.outerHTML)
        }else if(container.attributes.autoFix){
          isRenderedCorrectly = container.innerHTML ===  DOMnode.outerHTML
        }
        if(isRenderedCorrectly){
          node = attachEvents(container.firstChild)
        }else{
          node = DOMnode
          container.innerHTML = ''
          container.appendChild(node)
        }
      }
    }else{
      node = dom.create(vnode, rootId, dispatch, context)
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
