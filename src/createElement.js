import {renderThunk, createModel} from './thunk'
import {setAttribute} from './setAttribute'
import {getKey, isText, isThunk} from './utils'
import svg from './svg'
const cache = {}

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export default function createElement (vnode, context = {}, path = '0') {
  if (isText(vnode)) {
    vnode.el = document.createTextNode(vnode.nodeValue || '')
    return vnode.el
  }

  if (isThunk(vnode)) {
    vnode.model = createModel(vnode, context, path)
    vnode.data = renderThunk(vnode)
    vnode.el = createElement(vnode.data, context, path + '0')
    if (typeof vnode.attributes.onCreate === 'function') {
      vnode.attributes.onCreate(vnode.model)
    }
    return vnode.el
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
    let keyOrIndex = getKey(node) || index
    let child = createElement(node, context, path + '.' + keyOrIndex)
    DOMElement.appendChild(child)
  })

  vnode.el = DOMElement

  return vnode.el
}
