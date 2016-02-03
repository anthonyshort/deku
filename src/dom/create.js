import createNativeElement from '@f/create-element'
import {createPath} from '../element'
import {setAttribute} from './setAttribute'
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

export function createElement (vnode, path, dispatch, context) {
  switch (vnode.type) {
    case 'text':
      return createTextNode(vnode.nodeValue)
    case 'empty':
      return getCachedElement('noscript')
    case 'thunk':
      return createThunk(vnode, path, dispatch, context)
    case 'native':
      return createHTMLElement(vnode, path, dispatch, context)
  }
}

function getCachedElement (type) {
  let cached = cache[type]
  if (isUndefined(cached)) {
    cached = cache[type] = createNativeElement(type)
  }
  return cached.cloneNode(false)
}

function createTextNode (text) {
  let value = isString(text) || isNumber(text)
    ? text
    : ''
  return document.createTextNode(value)
}

function createThunk (vnode, path, dispatch, context) {
  let { props, children } = vnode
  let { onCreate } = vnode.options
  let model = {
    children,
    props,
    path,
    dispatch,
    context
  }
  let output = vnode.fn(model)
  let childPath = createPath(path, output.key || '0')
  let DOMElement = createElement(output, childPath, dispatch, context)
  if (onCreate) dispatch(onCreate(model))
  vnode.state = {
    vnode: output,
    model: model
  }
  return DOMElement
}

function createHTMLElement (vnode, path, dispatch, context) {
  let { tagName, attributes, children } = vnode
  let DOMElement = getCachedElement(tagName)

  for (let name in attributes) {
    setAttribute(DOMElement, name, attributes[name])
  }

  children.forEach((node, index) => {
    if (isNull(node) || isUndefined(node)) return
    let childPath = createPath(path, node.key || index)
    let child = createElement(node, childPath, dispatch, context)
    DOMElement.appendChild(child)
  })

  return DOMElement
}
