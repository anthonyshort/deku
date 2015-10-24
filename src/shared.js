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

/**
 * Determine if two virtual nodes are the same type
 */

export let isSameType = (left, right) => {
  return nodeType(left) === nodeType(right) && left.type === right.type
}

/**
 * Given a virtual element that is a function, we can render it using a model
 * and a context object. It caches the result on the node so we can optimize
 * the diffing later.
 */

export let renderCustomElement = (element, model, context) => {
  let render = element.type
  let rootElement = render(model, context)
  element.cache = rootElement
  return rootElement
}

/**
 * Create a model from a virtual element. The model is used in the render functions
 * of custom elements. Whatever we assign here, users will have access to.
 */

export let createModel = (element, path) => {
  return {
    attributes: element.attributes,
    children: element.children,
    path: path,
  }
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

export let isActiveAttribute = (value) => {
  if (typeof value === 'boolean') return value
  if (value === '') return true
  if (value === undefined) return false
  if (value === null) return false
  if (value === false) return false
  return true
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
