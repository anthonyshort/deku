import {setAttribute, removeAttribute} from './setAttribute'
import {insertAtIndex, removeAtIndex} from './utils'
import createElement from './createElement'
import {Actions} from './diff'

/**
 * Modify a DOM element given an array of actions. A context can be set
 * that will be used to render any custom elements.
 */

export default function patch (DOMElement, action) {
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
    removeChild: (vnode, index) => {
      removeAtIndex(DOMElement, index)
    },
    insertBefore: (index) => {
      insertAtIndex(DOMElement.parentNode, index, DOMElement)
    },
    updateChild: (index, actions) => {
      let child = DOMElement.childNodes[index]
      actions.forEach(action => patch(child, action))
      return DOMElement
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
