import {setAttribute, removeAttribute} from './setAttribute'
import {isThunk} from '../element'
import {Actions, diffNode} from '../diff'
import reduceArray from '@f/reduce-array'
import createElement, {storeInCache} from './create'
import toArray from '@f/to-array'
import forEach from '@f/foreach'
import noop from '@f/noop'

/**
 * Modify a DOM element given an array of actions.
 */

export default function updateElement (dispatch, context) {
  return (DOMElement, action) => {
    Actions.case({
      sameNode: noop,
      setAttribute: (name, value, previousValue) => {
        setAttribute(DOMElement, name, value, previousValue)
      },
      removeAttribute: (name, previousValue) => {
        removeAttribute(DOMElement, name, previousValue)
      },
      insertBefore: (index) => {
        insertAtIndex(DOMElement.parentNode, index, DOMElement)
      },
      updateChildren: (changes) => {
        updateChildren(DOMElement, changes, dispatch, context)
      },
      updateThunk: (prev, next, path) => {
        DOMElement = updateThunk(DOMElement, prev, next, path, dispatch, context)
      },
      replaceNode: (prev, next, path) => {
        let newEl = createElement(next, path, dispatch, context)
        let parentEl = DOMElement.parentNode
        if (parentEl) storeInCache(parentEl.replaceChild(newEl, DOMElement))
        DOMElement = newEl
        removeThunks(prev, dispatch)
      },
      removeNode: (prev) => {
        removeThunks(prev)
        storeInCache(DOMElement.parentNode.removeChild(DOMElement))
        DOMElement = null
      }
    }, action)

    return DOMElement
  }
}

/**
 * Update all the children of a DOMElement using an array of actions
 */

function updateChildren (DOMElement, changes, dispatch, context) {
  // Create a clone of the children so we can reference them later
  // using their original position even if they move around
  let childNodes = toArray(DOMElement.childNodes)
  changes.forEach(change => {
    Actions.case({
      insertChild: (vnode, index, path) => {
        insertAtIndex(DOMElement, index, createElement(vnode, path, dispatch, context))
      },
      removeChild: (index) => {
        storeInCache(DOMElement.removeChild(childNodes[index]))
      },
      updateChild: (index, actions) => {
        let _update = updateElement(dispatch, context)
        actions.forEach(action => _update(childNodes[index], action))
      }
    }, change)
  })
}

/**
 * Update a thunk and only re-render the subtree if needed.
 */

function updateThunk (DOMElement, prev, next, path, dispatch, context) {
  let { props, children } = next
  let { onUpdate } = next.options
  let prevNode = prev.state.vnode
  let model = {
    children,
    props,
    path,
    dispatch,
    context
  }
  let nextNode = next.fn(model)
  let changes = diffNode(prevNode, nextNode, path)
  DOMElement = reduceArray(updateElement(dispatch, context), DOMElement, changes)
  if (onUpdate) dispatch(onUpdate(model))
  next.state = {
    vnode: nextNode,
    model
  }
  return DOMElement
}

/**
 * Recursively remove all thunks
 */

function removeThunks (vnode, dispatch) {
  while (isThunk(vnode)) {
    let onRemove = vnode.options.onRemove
    let { model } = vnode.state
    if (onRemove) dispatch(onRemove(model))
    vnode = vnode.state.vnode
  }
  if (vnode.children) {
    forEach(vnode.children, child => removeThunks(child, dispatch))
  }
}

/**
 * Slightly nicer insertBefore
 */

export let insertAtIndex = (parent, index, el) => {
  let target = parent.childNodes[index]
  if (target) {
    parent.insertBefore(el, target)
  } else {
    parent.appendChild(el)
  }
}
