export let groupByKey = (children) => {
  return children.reduce((acc, child, i) => {
    if (child) {
      acc[getKey(child) || i] = {
        index: i,
        element: child
      }
    }
    return acc
  }, {})
}

let getKey = (element) => {
  return element && element.attributes && element.attributes.key
}

let appendTo = (container, el) => {
  if (el.parentNode !== container) {
    container.appendChild(el)
  }
}

let setTextContent = (DOMElement, value) => {
  DOMElement.data = value || ''
}

let insertAtIndex = (parent, index, el) => {
  var target = parent.childNodes[index]
  if (target) {
    parent.insertBefore(el, target)
  } else {
    appendTo(parent, el)
  }
}

let removeAtIndex = (DOMElement, index) => {
  DOMElement.removeChild(DOMElement.childNodes[index])
}

let isActiveAttribute = (value) => {
  if (typeof value === 'boolean') return value
  if (value === '') return false
  if (value === undefined) return false
  if (value === null) return false
  if (value === false) return false
  return true
}

let canSelectText = (DOMElement) => {
  return DOMElement.tagName === 'INPUT' && ['text','search','password','tel','url'].indexOf(DOMElement.type) > -1
}

let setElementValue = (DOMElement, value) => {
  if (DOMElement === document.activeElement && canSelectText(DOMElement)) {
    var start = DOMElement.selectionStart
    var end = DOMElement.selectionEnd
    DOMElement.value = value
    DOMElement.setSelectionRange(start, end)
  } else {
    DOMElement.value = value
  }
}

let getElementNamespace = (type) => {
  switch (type) {
    case 'animate':
    case 'circle':
    case 'defs':
    case 'ellipse':
    case 'g':
    case 'line':
    case 'linearGradient':
    case 'mask':
    case 'path':
    case 'pattern':
    case 'polygon':
    case 'radialGradient':
    case 'rect':
    case 'stop':
    case 'svg':
    case 'text':
    case 'tspan':
      return 'http://www.w3.org/2000/svg'
    default:
      return undefined
  }
}

let getAttributeNamespace = (type) => {
  switch (type) {
    case 'cx':
    case 'cy':
    case 'd':
    case 'dx':
    case 'dy':
    case 'fill':
    case 'fillOpacity':
    case 'fontFamily':
    case 'fontSize':
    case 'fx':
    case 'fy':
    case 'gradientTransform':
    case 'gradientUnits':
    case 'markerEnd':
    case 'markerMid':
    case 'markerStart':
    case 'offset':
    case 'opacity':
    case 'patternContentUnits':
    case 'patternUnits':
    case 'points':
    case 'preserveAspectRatio':
    case 'r':
    case 'rx':
    case 'ry':
    case 'spreadMethod':
    case 'stopColor':
    case 'stopOpacity':
    case 'stroke':
    case 'strokeDasharray':
    case 'strokeLinecap':
    case 'strokeOpacity':
    case 'strokeWidth':
    case 'textAnchor':
    case 'transform':
    case 'version':
    case 'viewBox':
    case 'x1':
    case 'x2':
    case 'x':
    case 'y1':
    case 'y2':
    case 'y':
      return 'http://www.w3.org/2000/svg'
    default:
      return undefined
  }
}

let getEvent = (() => {
  let events = {
    onBlur: 'blur',
    onChange: 'change',
    onClick: 'click',
    onContextMenu: 'contextmenu',
    onCopy: 'copy',
    onCut: 'cut',
    onDoubleClick: 'dblclick',
    onDrag: 'drag',
    onDragEnd: 'dragend',
    onDragEnter: 'dragenter',
    onDragExit: 'dragexit',
    onDragLeave: 'dragleave',
    onDragOver: 'dragover',
    onDragStart: 'dragstart',
    onDrop: 'drop',
    onError: 'error',
    onFocus: 'focus',
    onInput: 'input',
    onInvalid: 'invalid',
    onKeyDown: 'keydown',
    onKeyPress: 'keypress',
    onKeyUp: 'keyup',
    onMouseDown: 'mousedown',
    onMouseEnter: 'mouseenter',
    onMouseLeave: 'mouseleave',
    onMouseMove: 'mousemove',
    onMouseOut: 'mouseout',
    onMouseOver: 'mouseover',
    onMouseUp: 'mouseup',
    onPaste: 'paste',
    onReset: 'reset',
    onScroll: 'scroll',
    onSubmit: 'submit',
    onTouchCancel: 'touchcancel',
    onTouchEnd: 'touchend',
    onTouchMove: 'touchmove',
    onTouchStart: 'touchstart',
    onWheel: 'wheel'
  }
  return (name) => events[name]
})()

let createDOMElement = (type) => {
  let namespace = getElementNamespace(type)
  if (namespace) {
    return document.createElementNS(namespace, type)
  } else {
    return document.createElement(type)
  }
}

let attributeToString = (key, val) => {
  return ' ' + key + '="' + val + '"'
}

let attributesToString = (attributes) => {
  var str = ''
  for (var name in attributes) {
    var value = attributes[name]
    if (name === 'innerHTML') continue
    if (isActiveAttribute(value)) str += attributeToString(name, attributes[name])
  }
  return str
}

let nodeType = (element) => {
  if (typeof element === 'string') {
    return 'text'
  }
  switch (typeof element.type) {
    case 'string':
      return 'native'
    case 'function':
      return 'custom'
    default:
      throw new Error('Element type not supported')
  }
}

let createTextNode = (value) => {
  let node = document.createTextNode('')
  setTextContent(node, value)
  return node
}

let preOrderWalk = (fn, element) => {
  fn(element)
  switch (nodeType(element)) {
    case 'native':
      element.children.forEach(child => preOrderWalk(fn, child))
      break
    case 'custom':
      preOrderWalk(fn, element._cache)
      break
    default:
      break
  }

}

let postOrderWalk = (fn, element) => {
  element.children.forEach(child => postOrderWalk(fn, child))
  fn(element)
}

// Core
// -----------------------------------------------------------------------------

let diffChildren = (previous, next) => {
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
      changes.push({
        type: 'updateChild',
        actions: diff(previousChild.element, nextChild.element),
        index: nextChild.index
      })
    }
  }

  return changes
}

export let diff = (previousElement, nextElement) => {
  let changes = []

  if (previousElement === nextElement) {
    return changes
  }

  switch (nodeType(nextElement)) {
    case 'native':

      for (let name in nextElement.attributes) {
        let nextValue = nextElement.attributes[name]
        let previousValue = previousElement.attributes[name]
        if (!previousValue) {
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
        if (!nextElement.attributes[name]) {
          changes.push({
            type: 'removeAttribute',
            name: name
          })
        }
      }

      changes = changes.concat(
        diffChildren(previousElement.children, nextElement.children)
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
        type: 'updateCustomElement',
        previousElement: previousElement,
        nextElement: nextElement
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
      case 'updateCustomElement': {
        let cachedElement = action.previousElement._cache
        let updatedElement = renderCustomElement(action.nextElement, action.path, context)
        let actions = diff(cachedElement, updatedElement)
        DOMElement = patch(DOMElement, actions, context)
        if (typeof action.nextElement.type.onUpdate === 'function') {
          action.nextElement.type.onUpdate(DOMElement, context)
        }
        break
      }
      case 'addAttribute':
      case 'updateAttribute': {
        updateAttribute(DOMElement, action.name, action.value)
        break
      }
      case 'removeAttribute': {
        updateAttribute(DOMElement, action.name, null)
        break
      }
      case 'updateText': {
        setTextContent(DOMElement, action.value)
        break
      }
      case 'insertChild': {
        let child = createElement(action.element, action.path, context)
        insertAtIndex(DOMElement, action.index, child)
        offset = offset + 1
        break
      }
      case 'removeChild': {
        removeAtIndex(DOMElement, action.index)
        // Traverse action.element and call remove hooks
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

export let updateAttribute = (DOMElement, name, value) => {
  if (typeof value === 'function') {
    value = value(DOMElement, name)
  }
  if (!isActiveAttribute(value)) {
    switch (name) {
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
        let namespace = getAttributeNamespace(name)
        if (namespace) {
          DOMElement.setAttributeNS(namespace, name, value)
        } else {
          DOMElement.setAttribute(name, value)
        }
        break
    }
  }
}

let renderCustomElement = (element, path, context) => {
  let render = element.type
  let {attributes,children} = element
  let model = {
    attributes: attributes,
    children: children,
    path: path,
    context: context
  }
  let rootElement = render(model)
  element._cache = rootElement
  return rootElement
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
      var customElement = renderCustomElement(element, path, context)
      DOMElement = createElement(customElement, context, path)
      if (element.type.onCreate) {
        element.type.onCreate(DOMElement, context)
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
