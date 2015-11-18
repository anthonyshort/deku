import {nodeType, renderThunk, createModel, getKey} from './shared'
import {setAttribute} from './updateAttribute'
import svg from './svg'

/**
 * Cloning nodes is faster. Thanks @aschaffer.
 */

const cache = {}

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export default function createElement (element, context = {}, path = '0') {
  let type = nodeType(element)

  if (type === 'text') {
    return document.createTextNode(element || '')
  }

  if (type === 'thunk') {
    let model = createModel(element, context, path)
    let vnode = renderThunk(element, model)
    element.vnode = vnode
    let DOMElement = createElement(vnode, context, path + '0')
    // onCreate(element, DOMElement, context)
    // raf(onInsert(element, DOMElement, context))
    return DOMElement
  }

  let cached = cache[type]

  if (typeof cached === 'undefined') {
    cached = cache[element.type] = svg.isElement(element.type)
      ? document.createElementNS(svg.namespace, type)
      : document.createElement(type)
  }

  let DOMElement = cached.cloneNode(false)

  for (let name in element.attributes) {
    setAttribute(DOMElement, name, element.attributes[name])
  }

  element.children.forEach((node, index) => {
    let keyOrIndex = getKey(node) || index
    let child = createElement(node, context, path + '.' + keyOrIndex)
    DOMElement.appendChild(child)
  })

  return DOMElement
}
