import {setAttribute, removeAttribute} from './setAttribute'
import {insertAtIndex, removeAtIndex} from './utils'
import {diffNode, diffChildren} from './diff'
import createElement from './createElement'
import {renderThunk, createModel} from './thunk'
import {types} from './actions'

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export function createDOMRenderer (DOMElement) {
  let previousElement
  return (nextElement, context) => {
    if (!previousElement) {
      DOMElement.appendChild(createElement(nextElement, context))
    } else {
      let changes = diffChildren({ children: [previousElement] }, { children: [nextElement] })
      update(DOMElement, changes, context)
    }
    previousElement = nextElement
  }
}

/**
 * Modify a DOM element given an array of actions. A context can be set
 * that will be used to render any custom elements.
 */

export function update (DOMElement, action, context = {}) {
  if (Array.isArray(action)) {
    return action.reduce((el, action) => update(el, action, context), DOMElement)
  }

  let offset = 0

  switch (action.type) {
    case types.UPDATE_THUNK: {
      let {thunk, path, previousThunk} = action
      thunk.model = createModel(thunk, context, path)
      thunk.data = renderThunk(thunk)
      let actions = diffNode(previousThunk.data, thunk.data)
      thunk.el = update(DOMElement, actions, context)
      // onUpdate(thunk, DOMElement, context)
      break
    }
    case types.SET_ATTRIBUTE: {
      setAttribute(DOMElement, action.name, action.value, action.previousValue)
    }
    case types.REMOVE_ATTRIBUTE: {
      removeAttribute(DOMElement, action.name, action.previousValue)
      break
    }
    case types.INSERT_CHILD: {
      let child = createElement(action.vnode, context, action.path)
      insertAtIndex(DOMElement, action.index, child)
      offset = offset + 1
      break
    }
    case types.REMOVE_CHILD: {
      removeThunks(action.vnode)
      removeAtIndex(DOMElement, action.index + offset)
      offset = offset - 1
      break
    }
    case types.INSERT_BEFORE: {
      insertAtIndex(DOMElement.parentNode, action.to + offset, DOMElement)
      break
    }
    case types.UPDATE_CHILD: {
      update(DOMElement.childNodes[action.index + offset], action.actions, context)
      break
    }
    default:
      throw new Error(`Patch type ${action.type} not supported`)
  }

  return DOMElement
}

function removeThunks (thunk) {
  while (thunk.data) {
    let onDestroy = thunk.attributes.onDestroy
    if (typeof onDestroy === 'function') {
      onDestroy(thunk.model)
    }
    thunk = thunk.data
  }
  removeChildThunks(thunk)
  return thunk
}

function removeChildThunks (vnode) {
  const children = vnode.children
  if (!children) return
  for (let i = 0, len = children.length; i < len; ++i) {
    removeThunks(children[i])
  }
}
