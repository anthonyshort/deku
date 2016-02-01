import {isText, isThunk, isEmpty, createPath} from '../element'
import {setAttribute} from './setAttribute'
import svg from './svg'
const cache = {}

export default function createElement(vnode, path, dispatch, context) {
  let DOM =  createWithSideEffects(vnode, path, dispatch, context)
  runSideEffects(DOM.sideEffects)
  return DOM.element
}

export function createElementThenEvents(vnode, path, dispatch, context) {
  let DOM =  createWithSideEffects(vnode, path, dispatch, context)
  runSideEffects(DOM.sideEffects, {noEventListeners: true, })
  return {
    DOMnode: DOM.element,
    attachEvents: function(PreRenderedElement){
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
  if(sideEffects){
    sideEffects.ofParent.map(function(sideEffect){ sideEffect(option, DOMElement) })
    sideEffects.ofChildren.map(function(child,index){
      if(DOMElement){
        runSideEffects(child, option, DOMElement.childNodes[index])
      }else{
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

function createWithSideEffects (vnode, path, dispatch, context) {
  if (isText(vnode)) {
    let value = typeof vnode.nodeValue === 'string' || typeof vnode.nodeValue === 'number'
      ? vnode.nodeValue
      : ''
    return {element: document.createTextNode(value), sideEffects: null}
  }

  if (isEmpty(vnode)) {
    return {element: document.createElement('noscript'), sideEffects: null}
  }

  if (isThunk(vnode)) {
    let { props, component, children } = vnode
    let { onCreate } = component
    let render = typeof component === 'function' ? component : component.render
    let model = {
      children,
      props,
      path,
      dispatch,
      context
    }
    let output = render(model)
    let DOM = createWithSideEffects(
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
    return DOM
  }

  let cached = cache[vnode.type]

  if (typeof cached === 'undefined') {
    cached = cache[vnode.type] = svg.isElement(vnode.type)
      ? document.createElementNS(svg.namespace, vnode.type)
      : document.createElement(vnode.type)
  }

  let DOMElement = cached.cloneNode(false)
  let sideEffects = {ofParent: [], ofChildren: []}

  let attributes = Object.keys(vnode.attributes)
  sideEffects.ofParent = attributes.map(function(name){
    return function(option, element = DOMElement){
      setAttribute(element, name, vnode.attributes[name], null, option)
    }
  })

  vnode.children.forEach((node, index) => {
    if (node === null || node === undefined) return
    let DOM = createWithSideEffects(
      node,
      createPath(path, node.key || index),
      dispatch,
      context
    )
    sideEffects.ofChildren.push(DOM.sideEffects)
    DOMElement.appendChild(DOM.element)
  })

  return {element: DOMElement, sideEffects: sideEffects}
}
