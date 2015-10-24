import setElementValue from 'setify'
import isSVGAttribute from 'is-svg-attribute'
import {isElement as isSVGElement} from 'is-svg-element'
import {events, groupByKey, getKey, isActiveAttribute, nodeType, isSameType, renderCustomElement, createModel} from './shared'

/**
 * Contants
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

let createDOMElement = (type) => {
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

export let diffChildren = (previous, next, path = '0') => {
  let changes = []
  let previousChildren = groupByKey(previous)
  let nextChildren = groupByKey(next)
  for (let key in previousChildren) {
    let nextChild = nextChildren[key]
    let previousChild = previousChildren[key]
    if (!nextChildren[key] || !isSameType(previousChild.element, nextChild.element)) {
      changes.push({
        type: 'removeChild',
        element: previousChild.element,
        index: previousChild.index
      })
    }
  }
  for (let key in nextChildren) {
    let nextChild = nextChildren[key]
    let previousChild = previousChildren[key]
    if (!previousChild || !isSameType(previousChild.element, nextChild.element)) {
      changes.push({
        type: 'insertChild',
        element: nextChild.element,
        index: nextChild.index
      })
    } else {
      if (previousChild.index !== nextChild.index) {
        changes.push({
          type: 'moveChild',
          from: previousChild.index,
          to: nextChild.index
        })
      }
      let childActions = diff(previousChild.element, nextChild.element, path + '.' + key)
      if (childActions.length) {
        changes.push({
          type: 'updateChild',
          actions: childActions,
          index: nextChild.index
        })
      }
    }
  }
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
        } else if (nextValue !== previousValue)  {
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
        cache: previousElement.cache,
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
        let model = createModel(action.element, action.path)
        let next = renderCustomElement(action.element, model, context)
        let actions = diff(action.cache, next)
        patch(DOMElement, actions, context)
        if (typeof action.element.type.onUpdate === 'function') {
          action.element.type.onUpdate(model, context, DOMElement)
        }
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
      case 'checked':
      case 'disabled':
      case 'selected':
        DOMElement[name] = false
        break
      case 'innerHTML':
        DOMElement.innerHTML = ''
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
    case 'text':
      DOMElement = createTextNode(element)
      break
    case 'native':
      DOMElement = createDOMElement(element.type)
      for (let name in element.attributes) {
        updateAttribute(DOMElement, name, element.attributes[name])
      }
      element.children.forEach((node, index) => {
        let keyOrIndex = getKey(node) || index
        let child = createElement(node, context, path + '.' + keyOrIndex)
        DOMElement.appendChild(child)
      })
      break
    case 'custom':
      var model = createModel(element, path)
      var customElement = renderCustomElement(element, model, context)
      DOMElement = createElement(customElement, context, path + '0')
      if (typeof element.type.onCreate === 'function') {
        element.type.onCreate(model, context, DOMElement)
      }
      break
    default:
      throw new Error('Cannot create unknown element type')
  }
  return DOMElement
}

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export let createRenderer = (DOMElement) => {
  var previousElement
  return (nextElement, state) => {
    let changes = diffChildren([previousElement], [nextElement])
    patch(DOMElement, changes, state)
    previousElement = nextElement
  }
}
