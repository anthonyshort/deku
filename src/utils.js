/**
 * Get the key from a virtual element.
 */

export let getKey = (virtualElement) => {
  return virtualElement && virtualElement.attributes && virtualElement.attributes.key
}

/**
 * Check if an attribute shoudl be rendered into the DOM.
 */

export function isValidAttribute (value) {
  if (typeof value === 'boolean') return value
  if (value === '') return true
  if (value === undefined) return false
  if (value === null) return false
  if (value === false) return false
  return true
}

/**
 * Is a vnode a thunk?
 */

export let isThunk = (node) => {
  return node.type === '#thunk'
}

/**
 * Is a vnode a text node?
 */

export let isText = (node) => {
  return node.type === '#text'
}

/**
 * Determine if two virtual nodes are the same type
 */

export let isSameThunk = (left, right) => {
  return isThunk(left) && isThunk(right) && left.render === right.render
}

/**
 * Create a node path, eg. (23,5,2,4) => '23.5.2.4'
 */

export let createPath = (...args) => {
  return args.join('.')
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

/**
 * Remove an element at an index
 */

export let removeAtIndex = (DOMElement, index) => {
  DOMElement.removeChild(DOMElement.childNodes[index])
}
