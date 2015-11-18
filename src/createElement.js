import {createModel, renderThunk} from './thunk'
import {setAttribute} from './updateAttribute'
import {nodeType, getKey} from './utils'
import svg from './svg'
const cache = {}

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export default function createElement (element, context = {}, path = '0') {
  let type = nodeType(element)

  if (element.type === '#text') {
    return document.createTextNode(element.nodeValue || '')
  }

  if (type === 'thunk') {
    let model = createModel(element, context, path)
    element.data = renderThunk(element, model)
    let DOMElement = createElement(element.data, context, path + '0')
    // onCreate(element, DOMElement)
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
