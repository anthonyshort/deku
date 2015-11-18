import {setAttribute, removeAttribute} from './updateAttribute'
import {createModel, renderThunk} from './thunk'
import createElement from './createElement'
import {diffNode} from './diff'

function insertAtIndex (parent, index, el) {
  var target = parent.childNodes[index]
  if (target) {
    parent.insertBefore(el, target)
  } else {
    parent.appendChild(el)
  }
}

function removeAtIndex (DOMElement, index) {
  DOMElement.removeChild(DOMElement.childNodes[index])
}

/**
 * Modify a DOM element given an array of actions. A context can be set
 * that will be used to render any custom elements.
 */

export default function update (DOMElement, actions, context = {}) {
  let offset = 0
  actions.forEach(action => {
    switch (action.type) {
      case 'updateThunk': {
        let {thunk, path, previousThunk} = action
        let model = createModel(thunk, context, path)
        let vnode = renderThunk(thunk, model)
        let actions = diffNode(previousThunk.vnode, vnode)
        update(DOMElement, actions, context)
        thunk.data = vnode
        // onUpdate(thunk, DOMElement, context)
        break
      }
      case 'addAttribute':
      case 'updateAttribute': {
        let {name, value, previousValue} = action
        setAttribute(DOMElement, name, value, previousValue)
      }
      case 'removeAttribute': {
        removeAttribute(DOMElement, action.name, action.previousValue)
        break
      }
      case 'insertChild': {
        let child = createElement(action.element, context, action.path)
        insertAtIndex(DOMElement, action.index, child)
        offset = offset + 1
        break
      }
      case 'removeChild': {
        removeAtIndex(DOMElement, action.index + offset)
        // Walk action.element and call onRemove hooks
        offset = offset - 1
        break
      }
      case 'moveChild': {
        let fromNode = DOMElement.childNodes[action.from + offset]
        DOMElement.removeChild(fromNode)
        insertAtIndex(DOMElement, action.to + offset, fromNode)
        break
      }
      case 'updateChild': {
        update(DOMElement.childNodes[action.index + offset], action.actions, context)
        break
      }
      default:
        throw new Error('Patch type not supported')
    }
  })
}
