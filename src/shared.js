/**
 * Special attributes that map to DOM events.
 */

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
 * Get the content for a custom element
 */

export let renderCustomElement = (customElement, model, context) => {
  let render = customElement.type
  let rootElement = render(model, context)
  return rootElement
}

/**
 * The model is used in the custom element render function.
 */

export let createModel = (virtualElement, path) => {
  return {
    attributes: virtualElement.attributes,
    children: virtualElement.children,
    path: path
  }
}

/**
 * Group an array of virtual elements by their key, using index as a fallback.
 */

export let groupByKey = (children) => {
  return children.reduce((acc, child, i) => {
    if (child != null && child !== false) {
      acc.push({
        key: String(getKey(child) || i),
        item: child,
        index: i
      })
    }
    return acc
  }, [])
}

/**
 * Get the key from a virtual element.
 */

export let getKey = (virtualElement) => {
  return virtualElement && virtualElement.attributes && virtualElement.attributes.key
}

/**
 * Check if an attribute shoudl be rendered into the DOM.
 */

export let isActiveAttribute = (value) => {
  if (typeof value === 'boolean') return value
  if (value === '') return true
  if (value === undefined) return false
  if (value === null) return false
  if (value === false) return false
  return true
}

/**
 * Get the type of virtual element.
 */

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
