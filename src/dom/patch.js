import {setAttribute, removeAttribute} from './setAttribute'
import {insertAtIndex} from '../shared/utils'
import createElement from './createElement'
import {Actions, diffNode} from '../diff'

/**
 * Modify a DOM element given an array of actions. A context can be set
 * that will be used to render any custom elements.
 */

export default function patch (dispatch, context) {
  return (DOMElement, action) => {
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
            insertChild: (vnode, index, path) => {
              insertAtIndex(
                DOMElement,
                index,
                createElement(vnode, path, dispatch)
              )
            },
            removeChild: (index) => {
              DOMElement.removeChild(childNodes[index])
            },
            updateChild: (index, actions) => {
              let update = patch(dispatch)
              actions.forEach(action => update(childNodes[index], action))
            }
          }, change)
        })
      },
      updateThunk: (prev, next, path) => {
        let { props, children } = next
        let { render } = next.data
        let prevNode = prev.data.vnode
        let nextNode = render({
          children,
          props,
          path,
          dispatch,
          context
        })
        let changes = diffNode(prevNode, nextNode, path)
        DOMElement = changes.reduce(patch(dispatch, context), DOMElement)
        next.data.vnode = nextNode
      },
      replaceNode: (prev, next, path) => {
        let newEl = createElement(next, path, dispatch, context)
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
}
