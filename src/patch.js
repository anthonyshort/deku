import {setAttribute, removeAttribute} from './setAttribute'
import {insertAtIndex, removeAtIndex} from './utils'
import createElement from './createElement'
import {Actions, diffNode} from './diff'

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
    insertBefore: (index) => {
      insertAtIndex(DOMElement.parentNode, index, DOMElement)
    },
    updateChildren: (changes) => {
      // Create a clone of the children so we can reference them later
      // using their original position even if they move around
      let childNodes = Array.prototype.slice.apply(DOMElement.childNodes)
      changes.forEach(change => {
        Actions.case({
          insertChild: (vnode, index) => {
            insertAtIndex(DOMElement, index, createElement(vnode))
          },
          removeChild: (index) => {
            DOMElement.removeChild(childNodes[index])
          },
          updateChild: (index, actions) => {
            actions.forEach(action => patch(childNodes[index], action))
          }
        }, change)
      })
    },
    updateThunk: (prev, next) => {
      let { render } = next.data
      let prevNode = prev.data.vnode
      let nextNode = render({ props: next.props })
      let changes = diffNode(prevNode, nextNode)
      DOMElement = changes.reduce(patch, DOMElement)
      next.data.vnode = nextNode
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
