import {setAttribute, removeAttribute} from './setAttribute'
import {isThunk, createPath} from '../element'
import {create as createElement} from './create'
import {Actions, diffNode} from '../diff'

/**
 * Modify a DOM element given an array of actions.
 */

export function update (dispatch) {
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
      sameNode: () => {},
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
              let _update = update(dispatch)
              actions.forEach(action => _update(childNodes[index], action))
            }
          }, change)
        })
      },
      updateThunk: (prev, next, path) => {
        let { props, children, component } = next
        let { render, onUpdate } = component
        let prevNode = prev.state.vnode
        let model = {
          children,
          props,
          path,
          dispatch
        }
        let nextNode = render(model)
        let changes = diffNode(prevNode, nextNode, createPath(path, '0'))
        DOMElement = changes.reduce(update(dispatch), DOMElement)
        if (onUpdate) onUpdate(model)
        next.state = {
          vnode: nextNode,
          model: model
        }
      },
      replaceNode: (prev, next, path) => {
        let newEl = createElement(next, path, dispatch)
        let parentEl = DOMElement.parentNode
        if (parentEl) parentEl.replaceChild(newEl, DOMElement)
        DOMElement = newEl
        removeThunks(prev)
      },
      removeNode: (prev) => {
        removeThunks(prev)
        DOMElement.parentNode.removeChild(DOMElement)
        DOMElement = null
      }
    }, action)

    return DOMElement
  }
}

/**
 * Recursively remove all thunks
 */

function removeThunks (vnode) {
  while (isThunk(vnode)) {
    let { component, state } = vnode
    let { onRemove } = component
    let { model } = state
    if (onRemove) onRemove(model)
    vnode = state.vnode
  }

  if (vnode.children) {
    for (var i = 0; i < vnode.children.length; i++) {
      removeThunks(vnode.children[i])
    }
  }
}

/**
 * Slightly nicer insertBefore
 */

export let insertAtIndex = (parent, index, el) => {
  var target = parent.childNodes[index]
  if (target) {
    parent.insertBefore(el, target)
  } else {
    parent.appendChild(el)
  }
}
