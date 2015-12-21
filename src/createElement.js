import {setAttribute} from './setAttribute'
import {isText, isThunk} from './utils'
import svg from './svg'
const cache = {}

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export default function createElement (vnode) {
  if (isText(vnode)) {
    return document.createTextNode(vnode.nodeValue || '')
  }

  if (isThunk(vnode)) {
    let { props, data } = vnode
    let { render } = data
    let output = render({ props })
    vnode.data.vnode = output
    return createElement(output)
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
    let child = createElement(node)
    DOMElement.appendChild(child)
  })

  return DOMElement
}
