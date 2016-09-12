import {createPath} from '../element/index'
import {setAttribute} from './setAttribute'
import isUndefined from '@f/is-undefined'
import isString from '@f/is-string'
import isNumber from '@f/is-number'
import isNull from '@f/is-null'
import Pool from './pool'

const cache = new Pool()

// node manipulation action types
const CREATE = 'create'
const REPLACE = 'replace'
const NOOP = 'noop'

export default function createElement (vnode, path, dispatch, context) {
  let DOM = createWithSideEffects(vnode, path, dispatch, context)
  runSideEffects(DOM.sideEffects)
  return DOM.element
}

export function createElementThenEvents (vnode, path, dispatch, context, container = null) {
  let DOM = createWithSideEffects(vnode, path, dispatch, context, {originNode: container})
  runSideEffects(DOM.sideEffects, {noEventListeners: true})
  return {
    DOMnode: DOM.element,
    attachEvents (PreRenderedElement) {
      runSideEffects(DOM.sideEffects, {onlyEventListeners: true}, PreRenderedElement)
    }
  }
}

export function enableNodeRecycling (flag) {
  cache.enableRecycling(flag)
}

export function storeInCache (node) {
  cache.store(node)
}

/**
/* Recursively traverse a tree of side effects created by `createWithSideEffects`, and run each side effect.
 * Passing a third parameter DOMElement and it will traverse the DOMElement as well.
 *
 * A tree of side effects either takes in the value `null` or is a JSON object in the form
 * {ofParent : P, ofChildren : C}
 * where P is either an empty array or an array of functions
 * and C is either an empty array or an array of trees of side effects
 */
function runSideEffects (sideEffects, option, DOMElement) {
  if (sideEffects) {
    sideEffects.ofParent.map((sideEffect) => { sideEffect(option, DOMElement) })
    sideEffects.ofChildren.map((child, index) => {
      if (DOMElement) {
        runSideEffects(child, option, DOMElement.childNodes[index])
      } else {
        runSideEffects(child, option)
      }
    })
  }
}

/**
 * Create a DOM element with a tree of side effects from a virtual element by recursion.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */
export function createWithSideEffects (vnode, path, dispatch, context, options = {}) {
  switch (vnode.type) {
    case 'text':
      return createTextNode(vnode, options)
    case 'empty':
      return {element: cache.get('noscript'), sideEffects: null, action: CREATE}
    case 'thunk':
      return createThunk(vnode, path, dispatch, context, options)
    case 'native':
      return createHTMLElement(vnode, path, dispatch, context, options)
  }
}

function createTextNode ({nodeValue}, {originNode}) {
  let value = isString(nodeValue) || isNumber(nodeValue)
      ? nodeValue
      : ''

  // Determine action to perform after creating a text node
  let action = CREATE
  if (originNode && originNode.nodeValue) {
    action = NOOP
    if (originNode.nodeValue !== value) {
      action = REPLACE
    }
  }

  return {
    element: action !== NOOP ? document.createTextNode(value) : null,
    sideEffects: null,
    action
  }
}

function createThunk (vnode, path, dispatch, context, options) {
  let { props, children } = vnode
  let effects = {ofParent: [], ofChildren: []}

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
  let { element, sideEffects, action } = createWithSideEffects(output, childPath, dispatch, context, options)
  effects.ofChildren.push(sideEffects)

  if (onCreate) dispatch(onCreate(model))
  vnode.state = {
    vnode: output,
    model
  }
  return {element, sideEffects: effects, action}
}

function createHTMLElement (vnode, path, dispatch, context, {originNode}) {
  let DOMElement
  let sideEffects = {ofParent: [], ofChildren: []}
  let action = NOOP

  if (!originNode) { // no such element in markup -> create & append
    DOMElement = cache.get(vnode.tagName)
    action = CREATE
  } else if (!originNode.tagName || originNode.tagName.toLowerCase() !== vnode.tagName.toLowerCase()) {
    // found element, but with wrong type -> recreate & replace
    let newDOMElement = cache.get(vnode.tagName)
    Array.prototype.forEach.call(originNode.childNodes, (nodeChild) => {
      newDOMElement.appendChild(nodeChild)
    })

    DOMElement = newDOMElement
    action = REPLACE
  } else { // found node and type matches -> reuse
    DOMElement = originNode
  }

  // traverse and [re]create child nodes if needed
  let updateChild = nodesUpdater(DOMElement, path, dispatch, context)
  vnode.children.forEach((node, index) => updateChild(node, index, sideEffects))

  let attributes = Object.keys(vnode.attributes)
  sideEffects.ofParent = attributes.map((name) => {
    return function (option, element = DOMElement) {
      setAttribute(element, name, vnode.attributes[name], null, option)
    }
  })

  return {element: DOMElement, sideEffects, action}
}

/**
 * Nodes updater factory: creates vnode for every found real DOM node.
 *
 * Hardly relies on order of child nodes, so it may cause big overhead even
 * on minor differences, especially when difference occurs close to the
 * beginning of the document.
 *
 * @returns {Function}
 */
function nodesUpdater (parentNode, path, dispatch, context) {
  let i = 0

  return (node, index, sideEffects) => {
    if (isNull(node) || isUndefined(node)) return

    const originNode = parentNode.childNodes[i++] || null
    const DOM = createWithSideEffects(
      node,
      createPath(path, node.key || index),
      dispatch,
      context,
      {originNode}
    )

    sideEffects.ofChildren.push(DOM.sideEffects)

    switch (DOM.action) {
      case CREATE:
        parentNode.appendChild(DOM.element)
        break
      case REPLACE:
        cache.store(parentNode.replaceChild(DOM.element, originNode))
        break
      default:
    }
  }
}
