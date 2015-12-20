/**
 * Check if an attribute shoudl be rendered into the DOM.
 */

export function isValidAttribute (value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'function') return false
  if (value === '') return true
  if (value === undefined) return false
  if (value === null) return false
  if (value === false) return false
  return true
}

/**
 * Group an array of virtual elements by their key, using index as a fallback.
 */

export let groupByKey = (children) => {
  return children.reduce((acc, child, i) => {
    if (child != null && child !== false) {
      acc.push({
        key: String(child.key || i),
        item: child,
        index: i
      })
    }
    return acc
  }, [])
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
 * Find a child node at a given path. Takes any tree that uses a
 * 'children' key. This will work for both virtual nodes and real
 * DOM trees.
 */

export let findNodeAtPath = (path, tree) => {
  let parts = path.split('.')
  let node
  while (parts.length) {
    let index = parts.shift()
    node = tree.children[index]
  }
  return node
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
