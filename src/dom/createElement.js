import {setAttribute} from './setAttribute'
import {isText, isThunk, createPath} from '../shared/utils'
import svg from '../shared/svg'
const cache = {}

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export default function createElement (vnode, path, dispatch, context) {
  if (isText(vnode)) {
    return document.createTextNode(vnode.nodeValue || '')
  }

  if (isThunk(vnode)) {
    let { props, data, children } = vnode
    let { render, onCreate } = data
    let model = {
      children,
      props,
      path,
      dispatch,
      context
    }
    let output = render(model)
    let DOMElement = createElement(
      output,
      createPath(path, output.key || '0')
    )
    if (onCreate) onCreate(model)
    vnode.data.vnode = output
    vnode.data.model = model
    return DOMElement
  }

  let cached = cache[vnode.type]

  if (typeof cached === 'undefined') {
    cached = cache[vnode.type] = svg.isElement(vnode.type)
      ? document.createElementNS(svg.namespace, vnode.type)
      : document.createElement(vnode.type)
  }

  let DOMElement = cached.cloneNode(false)

  for (let name in vnode.attributes) {
    setAttribute(DOMElement, name, vnode.attributes[name])
  }

  vnode.children.forEach((node, index) => {
    if (node === null || node === undefined) {
      return
    }
    let child = createElement(
      node,
      createPath(path, node.key || index)
    )
    DOMElement.appendChild(child)
  })

  return DOMElement
}
