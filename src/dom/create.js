import {isText, isThunk, isEmpty, createPath} from '../element'
import {setAttribute} from './setAttribute'
import createElement from '@f/create-element'
import isUndefined from '@f/is-undefined'
import isString from '@f/is-string'
import isNumber from '@f/is-number'
import isNull from '@f/is-null'
const cache = {}

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export function create (vnode, path, dispatch) {
  if (isText(vnode)) {
    let text = vnode.nodeValue
    let value = isString(text) || isNumber(text)
      ? vnode.nodeValue
      : ''
    return document.createTextNode(value)
  }

  if (isEmpty(vnode)) {
    return getCachedElement('noscript')
  }

  if (isThunk(vnode)) {
    let { props, component, children } = vnode
    let { render, onCreate } = component
    let model = {
      children,
      props,
      path,
      dispatch
    }
    let output = render(model)
    let DOMElement = create(
      output,
      createPath(path, output.key || '0'),
      dispatch
    )
    if (onCreate) onCreate(model)
    vnode.state = {
      vnode: output,
      model: model
    }
    return DOMElement
  }

  let DOMElement = getCachedElement(vnode.type)

  for (let name in vnode.attributes) {
    setAttribute(DOMElement, name, vnode.attributes[name])
  }

  vnode.children.forEach((node, index) => {
    if (isNull(node) || isUndefined(node)) {
      return
    }
    let child = create(
      node,
      createPath(path, node.key || index),
      dispatch
    )
    DOMElement.appendChild(child)
  })

  return DOMElement
}

function getCachedElement (type) {
  let cached = cache[type]

  if (isUndefined(cached)) {
    cached = cache[type] = createElement(type)
  }

  return cached.cloneNode(false)
}
