import {setAttribute, removeAttribute} from './setAttribute'
import {insertAtIndex, removeAtIndex} from './utils'
import createElement from './createElement'
import {Actions} from './diff'

/**
 * Modify a DOM element given an array of actions. A context can be set
 * that will be used to render any custom elements.
 */

export default function patch (DOMElement, action) {
  // Create a clone of the children so we can reference them later
  // using their original position even if they move around
  let childNodes = Array.prototype.slice.apply(DOMElement.childNodes)

  Actions.case({
    setAttribute: (name, value, previousValue) => {
      setAttribute(DOMElement, name, value, previousValue)
    },
    removeAttribute: (name, previousValue) => {
      removeAttribute(DOMElement, name, previousValue)
    },
    insertChild: (vnode, index) => {
      insertAtIndex(DOMElement, index, createElement(vnode))
    },
    removeChild: (index) => {
      DOMElement.removeChild(childNodes[index])
    },
    insertBefore: (index) => {
      insertAtIndex(DOMElement.parentNode, index, DOMElement)
    },
    updateChild: (index, actions) => {
      actions.forEach(action => patch(childNodes[index], action))
    },
    replaceNode: (prev, next) => {
      let newEl = createElement(next)
      DOMElement.parentNode.replaceChild(newEl, DOMElement)
      DOMElement = newEl
    },
    removeNode: (prev) => {
      DOMElement.parentNode.removeChild(DOMElement)
      DOMElement = null
    }
  }, action)
  return DOMElement
}
