import setElementValue from 'setify'
import isSVGAttribute from 'is-svg-attribute'
import {isElement as isSVGElement} from 'is-svg-element'
import {events, groupByKey, getKey, isActiveAttribute, nodeType, renderCustomElement, createModel} from './shared'
import raf from 'component-raf'
import dift from 'dift'

/**
 * Used when we're creating SVG elements or attributes
 */

const svgNamespace = 'http://www.w3.org/2000/svg'

/**
 * Set text content without worrying about toString. This function is responsible
 * for what can be shown as text content.
 */

let setTextContent = (DOMElement, value) => {
  DOMElement.data = value || ''
}

/**
 * Create a new text node and set the text correctly, even if
 * falsy values are thrown at it.
 */

let createTextNode = (value) => {
  let node = document.createTextNode('')
  setTextContent(node, value)
  return node
}

/**
 * Create a DOM element, setting the namespace for SVGs. Doesn't
 * handle elements with any namespace.
 */

let createDOMElementByType = (type) => {
  if (isSVGElement(type)) {
    return document.createElementNS(svgNamespace, type)
  } else {
    return document.createElement(type)
  }
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
 * Compare two arrays of virtual nodes and return an array of actions
 * to transform the left into the right. A starting path is supplied that use
 * recursively to build up unique paths for each node.
 */

export let diffChildren = (previousChildren, nextChildren, path = '0') => {
  let changes = []
  let previous = groupByKey(previousChildren)
  let next = groupByKey(nextChildren)

  dift(previous, next, (type, prev, next) => {
    switch (type) {
      case dift.CREATE: {
        changes.push({
          type: 'insertChild',
          element: next.item,
          index: next.index
        })
        break
      }
      case dift.UPDATE: {
        changes.push({
          type: 'updateChild',
          actions: diff(prev.item, next.item, path + '.' + prev.index),
          index: prev.index
        })
        break
      }
      case dift.MOVE: {
        changes.push({
          type: 'updateChild',
          actions: diff(prev.item, next.item, path + '.' + prev.index),
          index: prev.index
        })
        changes.push({
          type: 'moveChild',
          from: prev.index,
          to: next.index
        })
        break
      }
      case dift.REMOVE: {
        changes.push({
          type: 'removeChild',
          index: prev.index,
          element: prev.item
        })
        break
      }
    }
  })
  return changes
}

/**
 * Compare two virtual nodes and return an array of changes to turn the left
 * into the right.
 */

export let diff = (previousElement, nextElement, path = '0') => {
  let changes = []
  if (previousElement === nextElement) {
    return changes
  }
  switch (nodeType(nextElement)) {
    case 'native':
      for (let name in nextElement.attributes) {
        let nextValue = nextElement.attributes[name]
        let previousValue = previousElement.attributes[name]
        if (!(name in previousElement.attributes)) {
          changes.push({
            type: 'addAttribute',
            name: name,
            value: nextValue
          })
        } else if (nextValue !== previousValue) {
          changes.push({
            type: 'updateAttribute',
            name: name,
            value: nextValue
          })
        }
      }
      for (let name in previousElement.attributes) {
        if (!(name in nextElement.attributes)) {
          changes.push({
            type: 'removeAttribute',
            name: name,
            previousValue: previousElement.attributes[name]
          })
        }
      }
      changes = changes.concat(
        diffChildren(previousElement.children, nextElement.children, path)
      )
      break
    case 'text':
      changes.push({
        type: 'updateText',
        value: nextElement,
        previousValue: previousElement
      })
      break
    case 'custom':
      changes.push({
        type: 'updateCustom',
        previousElement: previousElement,
        element: nextElement,
        path: path
      })
      break
    default:
      throw new Error('Node type not supported')
  }
  return changes
}

/**
 * Modify a DOM element given an array of actions. A context can be set
 * that will be used to render any custom elements.
 */

export let patch = (DOMElement, actions, context = {}) => {
  let offset = 0
  actions.forEach(action => {
    switch (action.type) {
      case 'updateCustom': {
        let CustomElement = action.element
        let model = createModel(CustomElement, action.path)
        let nextContent = renderCustomElement(CustomElement, model, context)
        let previousContent = action.previousElement.cache
        // TODO: Handle when there is no cached render
        let actions = diff(previousContent, nextContent)
        patch(DOMElement, actions, context)
        CustomElement.cache = nextContent
        onUpdate(CustomElement, DOMElement, context)
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
        patch(DOMElement.childNodes[action.index + offset], action.actions, context)
        break
      }
      default:
        throw new Error('Patch type not supported')
    }
  })
}

/**
 * Update an attribute on a DOM element. This handles special cases where we set
 * properties and events too. It is responsible for how attributes should be rendered
 * from the virtual elements.
 */

export let updateAttribute = (DOMElement, name, value, previousValue) => {
  if (typeof value === 'function') {
    value = value(DOMElement, name)
  }
  if (!isActiveAttribute(value)) {
    switch (name) {
      case events[name]:
        DOMElement.addEventListener(events[name], value)
        break
      case 'checked':
      case 'disabled':
      case 'selected':
        DOMElement[name] = false
        break
      case 'innerHTML':
        DOMElement.innerHTML = ''
        break
      case 'value':
        setElementValue(DOMElement, null)
        break
      default:
        DOMElement.removeAttribute(name)
        break
    }
    return
  } else {
    switch (name) {
      case events[name]:
        DOMElement.removeEventListener(events[name], previousValue)
        break
      case 'checked':
      case 'disabled':
      case 'selected':
        DOMElement[name] = true
        break
      case 'innerHTML':
        DOMElement.innerHTML = value
        break
      case 'value':
        setElementValue(DOMElement, value)
        break
      default:
        if (isSVGAttribute(name)) {
          DOMElement.setAttributeNS(svgNamespace, name, value)
        } else {
          DOMElement.setAttribute(name, value)
        }
        break
    }
  }
}

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export let createElement = (element, context = {}, path = '0') => {
  let DOMElement
  switch (nodeType(element)) {
    case 'text': {
      DOMElement = createTextNode(element)
      break
    }
    case 'native': {
      DOMElement = createDOMElementByType(element.type)
      for (let name in element.attributes) {
        updateAttribute(DOMElement, name, element.attributes[name])
      }
      element.children.forEach((node, index) => {
        let keyOrIndex = getKey(node) || index
        let child = createElement(node, context, path + '.' + keyOrIndex)
        DOMElement.appendChild(child)
      })
      break
    }
    case 'custom': {
      let model = createModel(element, path)
      let content = renderCustomElement(element, model, context)
      element.cache = content
      DOMElement = createElement(content, context, path + '0')
      onCreate(element, DOMElement, context)
      raf(onInsert(element, DOMElement, context))
      break
    }
    default: {
      throw new Error('Cannot create unknown element type')
    }
  }
  return DOMElement
}

/**
 * Call the onCreate hook on a Custom Element
 */

let onCreate = (CustomElement, ...args) => {
  let fn = CustomElement.type.onCreate
  if (typeof fn === 'function') {
    fn(...args)
  }
}

/**
 * Call the onUpdate hook on a Custom Element
 */

let onUpdate = (CustomElement, ...args) => {
  let fn = CustomElement.type.onUpdate
  if (typeof fn === 'function') {
    fn(...args)
  }
}

/**
 * Call onInsert hook on a Custom Element
 */

let onInsert = (CustomElement, ...args) => {
  return () => {
    let fn = CustomElement.type.onInsert
    if (typeof fn === 'function') {
      fn(...args)
    }
  }
}

/**
 * Call onRemove on an Custom Element and all nested custom elements
 */

// let onRemove = (element, ...args) => {
//   if (element.cache) {
//     walk(onRemove)(element.cache)
//   }
//   let fn = element.type.onRemove
//   if (typeof fn === 'function') {
//     fn(...args)
//   }
// }

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export let createRenderer = (DOMElement) => {
  let previousElement
  return (nextElement, context) => {
    let changes = diffChildren([previousElement], [nextElement])
    patch(DOMElement, changes, context)
    previousElement = nextElement
  }
}
