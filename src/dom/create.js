import createNativeElement from '@f/create-element'
import {createPath} from '../element/index'
import {setAttribute} from './setAttribute'
import isUndefined from '@f/is-undefined'
import isString from '@f/is-string'
import isNumber from '@f/is-number'
import isNull from '@f/is-null'
const cache = {}

export default function createElement(vnode, path, dispatch, context) {
  let DOM =  createWithSideEffects(vnode, path, dispatch, context)
  runSideEffects(DOM.sideEffects)
  return DOM.element
}

export function createElementThenEvents(vnode, path, dispatch, context) {
  let DOM =  createWithSideEffects(vnode, path, dispatch, context)
  runSideEffects(DOM.sideEffects, {noEventListeners: true})
  return {
    DOMnode: DOM.element,
    attachEvents(PreRenderedElement){
      runSideEffects(DOM.sideEffects, {onlyEventListeners: true}, PreRenderedElement)
    }
  }
}

/**
/* Recursively traverse a tree of side effects created by `createWithSideEffects`, and run each side effect.
 * Passing a third parameter DOMElement and it will traverse the DOMElement as well.
 *
 * A tree of side effects either takes in the value `null` or is a JSON object in the form
 * {ofParent : P, ofChildren : C}
 * where P is either an empty array or an array of functions
 * and C is either an empty array or an array of trees of side effects
 *
 */

function runSideEffects(sideEffects, option, DOMElement){
  if (sideEffects) {
    sideEffects.ofParent.map((sideEffect) => { sideEffect(option, DOMElement) })
    sideEffects.ofChildren.map((child,index) => {
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
 *
 */

export function createWithSideEffects (vnode, path, dispatch, context) {
  let el
  switch (vnode.type) {
    case 'text':
      return {element: createTextNode(vnode.nodeValue), sideEffects: null}
    case 'empty':
      el = getCachedElement('noscript')
      el.attributes['__created'] = true
      return {element: el, sideEffects: null}
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
  let sideEffects = {ofParent: [], ofChildren: []}

  let { onCreate } = vnode.options
  let model = {
    children,
    props,
    path,
    dispatch,
    context
  }
  let output = vnode.fn(model)
  let { element, effects } = createWithSideEffects(output, path, dispatch, context)
  sideEffects.ofChildren.push(effects)

  if (onCreate) dispatch(onCreate(model))
  vnode.state = {
    vnode: output,
    model
  }
  return {element, sideEffects}
}

function createHTMLElement (vnode, path, dispatch, context) {
  let DOMElement
  let sideEffects = {ofParent: [], ofChildren: []}

  DOMElement = document.getElementById('_id' + path)
  if (!DOMElement) {
    // no such element on client -> create
    DOMElement = getCachedElement(vnode.tagName)
    DOMElement.attributes['__created'] = true // Parent will append this node when this flag is set
  } else if (DOMElement.tagName.toLowerCase() != vnode.tagName.toLowerCase()) {
    // found element, but with wrong type -> recreate
    let newDOMElement = getCachedElement(vnode.tagName)

    Array.prototype.forEach.call(DOMElement.childNodes, (nodeChild) => {
      newDOMElement.appendChild(nodeChild)
    })

    DOMElement.parentNode.replaceChild(newDOMElement, DOMElement)
    DOMElement = newDOMElement
  }

  const textIterator = document.createNodeIterator(DOMElement, NodeFilter.SHOW_TEXT)
  for (let index in vnode.children) {
    let DOM
    const node = vnode.children[index]
    if (isNull(node) || isUndefined(node)) continue

    if (node.type == 'text') {
      const textnode = textIterator.nextNode()

      if (!textnode || textnode.nodeValue != node.nodeValue) {
        DOM = createWithSideEffects(
          node,
          createPath(path, node.key || index),
          dispatch,
          context
        )
        sideEffects.ofChildren.push(DOM.sideEffects)

        if (!textnode) {
          DOMElement.appendChild(DOM.element)
        } else { // node values not equal
          DOMElement.replaceChild(DOM.element, textnode)
        }
      }

      continue
    }

    DOM = createWithSideEffects(
      node,
      createPath(path, node.key || index),
      dispatch,
      context
    )
    sideEffects.ofChildren.push(DOM.sideEffects)
    if (DOM.element.attributes && DOM.element.attributes['__created']) {
      // newly created html node: add it
      DOMElement.appendChild(DOM.element)
    }
  }

  let attributes = Object.keys(vnode.attributes)
  sideEffects.ofParent = attributes.map((name) => {
    return function(option, element = DOMElement) {
      setAttribute(element, name, vnode.attributes[name], null, option)
    }
  })
  
  return {element: DOMElement, sideEffects}
}
