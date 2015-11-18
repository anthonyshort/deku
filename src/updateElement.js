import {createModel, renderThunk} from './shared'
import updateAttribute from './updateAttribute'
import createElement from './createElement'
import {diffNode} from './diff'

/**
 * Set text content without worrying about toString. This function is responsible
 * for what can be shown as text content.
 */

let setTextContent = (DOMElement, value) => {
  DOMElement.data = value || ''
}

/**
 * Insert an element at an index. Normally we'd just use insertBefore, but
 * IE10 will cry if the target is undefined, other browsers just append it.
 */

let insertAtIndex = (parent, index, el) => {
  var target = parent.childNodes[index]
  if (target) {
    parent.insertBefore(el, target)
  } else {
    parent.appendChild(el)
  }
}

/**
 * Remove a node at an index instead of using the element as the target.
 */

let removeAtIndex = (DOMElement, index) => {
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
        thunk.vnode = vnode
        // onUpdate(thunk, DOMElement, context)
        break
      }
      case 'addAttribute':
      case 'updateAttribute': {
        updateAttribute(DOMElement, action.name, action.value)
        break
      }
      case 'removeAttribute': {
        updateAttribute(DOMElement, action.name, action.value, action.previousValue)
        break
      }
      case 'updateText': {
        setTextContent(DOMElement, action.value)
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
