import {isElement as isSVGElement} from 'is-svg-element'

export const svgNamespace = 'http://www.w3.org/2000/svg'

export let events = {
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
  onLoad: 'load',
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

export let getKey = (element) => {
  return element && element.attributes && element.attributes.key
}

export let setTextContent = (DOMElement, value) => {
  DOMElement.data = value || ''
}

export let insertAtIndex = (parent, index, el) => {
  var target = parent.childNodes[index]
  if (target) {
    parent.insertBefore(el, target)
  } else {
    parent.appendChild(el)
  }
}

export let removeAtIndex = (DOMElement, index) => {
  DOMElement.removeChild(DOMElement.childNodes[index])
}

export let isActiveAttribute = (value) => {
  if (typeof value === 'boolean') return value
  if (value === '') return true
  if (value === undefined) return false
  if (value === null) return false
  if (value === false) return false
  return true
}

export let createDOMElement = (type) => {
  if (isSVGElement(type)) {
    return document.createElementNS(svgNamespace, type)
  } else {
    return document.createElement(type)
  }
}

export let attributeToString = (key, val) => {
  return ' ' + key + '="' + val + '"'
}

export let attributesToString = (attributes) => {
  var str = ''
  for (var name in attributes) {
    var value = attributes[name]
    if (name === 'innerHTML') continue
    if (isActiveAttribute(value)) str += attributeToString(name, attributes[name])
  }
  return str
}

export let nodeType = (element) => {
  switch (typeof element.type) {
    case 'string':
      return 'native'
    case 'function':
      return 'custom'
    default:
      return 'text'
  }
}

export let createTextNode = (value) => {
  let node = document.createTextNode('')
  setTextContent(node, value)
  return node
}

export let preOrderWalk = (fn, element) => {
  fn(element)
  if (element.cache) {
    preOrderWalk(fn, element.cache)
  } else {
    element.children.forEach(child => preOrderWalk(fn, child))
  }
}

export let postOrderWalk = (fn, element) => {
  if (element.cache) {
    postOrderWalk(fn, element.cache)
  } else {
    element.children.forEach(child => postOrderWalk(fn, child))
  }
  fn(element)
}
