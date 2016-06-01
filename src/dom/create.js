import createNativeElement from '@f/create-element'
import {createPath} from '../element'
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

export function createWithSideEffects (vnode, path, dispatch, context) {
  switch (vnode.type) {
    case 'text':
      return {element: createTextNode(vnode.nodeValue), sideEffects: null}
    case 'empty':
      const el = getCachedElement('noscript')
      el.attributes['__created'] = true
      return {element: el, sideEffects: null}
    case 'thunk':
      return {element: createThunk(vnode, path, dispatch, context), sideEffects: null}
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
  // let childPath = createPath(path, output.key || '0')
  let DOMElement = createElement(output, path, dispatch, context)
  if (onCreate) dispatch(onCreate(model))
  vnode.state = {
    vnode: output,
    model: model
  }
  return DOMElement
}

function createHTMLElement (vnode, path, dispatch, context) {
  let DOMElement;
  let sideEffects = {ofParent: [], ofChildren: []}

  DOMElement = document.getElementById('_id' + path)
  if (!DOMElement) {
    // no such element on client -> create
    DOMElement = getCachedElement(vnode.tagName)
    DOMElement.attributes['__created'] = true; // Parent will append this node when this flag is set
  } else if (DOMElement.tagName.toLowerCase() != vnode.tagName.toLowerCase()) {
    // found element, but with wrong type -> recreate
    let newDOMElement = getCachedElement(vnode.tagName)

    Array.prototype.forEach.call(DOMElement.childNodes, function(nodeChild){
      newDOMElement.appendChild(nodeChild);
    });   

    DOMElement.parentNode.replaceChild(newDOMElement, DOMElement);
    DOMElement = newDOMElement;
  }

  let textIterator = document.createNodeIterator(DOMElement, NodeFilter.SHOW_TEXT);
  vnode.children.forEach((node, index) => {
    if (isNull(node) || isUndefined(node)) return

    if (node.type == 'text') {
      let textnode = textIterator.nextNode();

      if (!textnode || textnode.nodeValue != node.nodeValue) {
        let DOM = createWithSideEffects(
          node,
          createPath(path, node.key || index),
          dispatch,
          context
        )
        sideEffects.ofChildren.push(DOM.sideEffects)

        if (!textnode) {
          DOMElement.appendChild(DOM.element);
        } else { // node values not equal
          DOMElement.replaceChild(DOM.element, textnode)
        }
      }

      return
    }

    let DOM = createWithSideEffects(
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
  })

  let attributes = Object.keys(vnode.attributes)
  sideEffects.ofParent = attributes.map(function(name){
    return function(option, element = DOMElement) {
      setAttribute(element, name, vnode.attributes[name], null, option)
    }
  })
  
  return {element: DOMElement, sideEffects: sideEffects}
}
