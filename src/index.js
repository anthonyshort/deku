import setElementValue from 'setify'
import isSVGAttribute from 'is-svg-attribute'
import {
  events,
  groupByKey,
  getKey,
  setTextContent,
  insertAtIndex,
  removeAtIndex,
  isActiveAttribute,
  createDOMElement,
  attributeToString,
  attributesToString,
  nodeType,
  createTextNode,
  preOrderWalk,
  postOrderWalk
} from './helpers'

let diffChildren = (previous, next, path = '0') => {
  let changes = []
  let previousChildren = groupByKey(previous)
  let nextChildren = groupByKey(next)
  for (let key in previousChildren) {
    let nextChild = nextChildren[key]
    let previousChild = previousChildren[key]
    if (!nextChildren[key] || nodeType(previousChild.element) !== nodeType(nextChild.element) || previousChild.element.type !== nextChild.element.type) {
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
    if (!previousChild || nodeType(previousChild.element) !== nodeType(nextChild.element) || previousChild.element.type !== nextChild.element.type) {
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

let renderCustomElement = (element, model, context) => {
  let render = element.type
  let rootElement = render(model, context)
  element.cache = rootElement
  return rootElement
}

let createModel = (element, path) => {
  return {
    attributes: element.attributes,
    children: element.children,
    path: path,
  }
}

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
      DOMElement = createElement(customElement, context, path)
      if (typeof element.type.onCreate === 'function') {
        element.type.onCreate(model, context, DOMElement)
      }
      break
    default:
      throw new Error('Cannot create unknown element type')
  }
  return DOMElement
}

export let createRenderer = (DOMElement) => {
  var previousElement
  return (nextElement, context) => {
    let changes = diffChildren([previousElement], [nextElement])
    patch(DOMElement, changes, context)
    previousElement = nextElement
  }
}

export let renderString = (element, context, path = '0') => {
  switch (nodeType(element)) {
    case 'empty':
      return '<noscript />'
    case 'text':
      return element
    case 'element':
      var attributes = element.attributes
      var tagName = element.type
      var innerHTML = attributes.innerHTML
      var str = '<' + tagName + attributesToString(attributes) + '>'
      if (innerHTML) {
        str += innerHTML
      } else {
        str += element.children.map((child, i) => {
          let keyOrIndex = getKey(child) || i
          renderString(child, context, path + '.' + keyOrIndex)
        }).join('')
      }
      str += '</' + tagName + '>'
      return str
    case 'custom':
      return renderString(renderCustomElement(element, path, context), context)
    default:
      return ''
  }
}
