import {isText, isThunk, isEmpty, createPath} from '../element'
import {setAttribute} from './setAttribute'
import svg from './svg'
const cache = {}

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export default function createElement (vnode, path, dispatch, context) {
  if (isText(vnode)) {
    let value = typeof vnode.nodeValue === 'string' || typeof vnode.nodeValue === 'number'
      ? vnode.nodeValue
      : ''
    return document.createTextNode(value)
  }

  if (isEmpty(vnode)) {
    return document.createElement('noscript')
  }

  if (isThunk(vnode)) {
    let { props, component, children } = vnode
    let { render, onCreate } = component
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
      createPath(path, output.key || '0'),
      dispatch,
      context
    )
    if (onCreate) onCreate(model)
    vnode.state = {
      vnode: output,
      model: model
    }
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
      createPath(path, node.key || index),
      dispatch,
      context
    )
    DOMElement.appendChild(child)
  })

  return DOMElement
}
