import {setAttribute, removeAttribute} from './setAttribute'
import {insertAtIndex, removeAtIndex} from './utils'
import createElement from './createElement'
import {types} from './actions'

/**
 * Modify a DOM element given an array of actions. A context can be set
 * that will be used to render any custom elements.
 */

export default function patch (DOMElement, action) {
  switch (action.type) {
    case types.SET_ATTRIBUTE: {
      setAttribute(DOMElement, action.name, action.value, action.previousValue)
      return DOMElement
    }
    case types.REMOVE_ATTRIBUTE: {
      removeAttribute(DOMElement, action.name, action.previousValue)
      return DOMElement
    }
    case types.INSERT_CHILD: {
      insertAtIndex(DOMElement, action.index, createElement(action.vnode))
      return DOMElement
    }
    case types.REMOVE_CHILD: {
      removeAtIndex(DOMElement, action.index)
      return DOMElement
    }
    case types.INSERT_BEFORE: {
      insertAtIndex(DOMElement.parentNode, action.index, DOMElement)
      return DOMElement
    }
    case types.UPDATE_CHILD: {
      let child = DOMElement.childNodes[action.index]
      action.actions.forEach(action => patch(child, action))
      return DOMElement
    }
    default:
      throw new Error(`Patch type ${action.type} not supported`)
  }
}
