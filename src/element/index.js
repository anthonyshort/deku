/**
 * This function lets us create virtual nodes using a simple
 * syntax. It is compatible with JSX transforms so you can use
 * JSX to write nodes that will compile to this function.
 *
 * let node = element('div', { id: 'foo' }, [
 *   element('a', { href: 'http://google.com' },
 *     element('span', {}, 'Google'),
 *     element('b', {}, 'Link')
 *   )
 * ])
 */

export function create (type, attributes, ...children) {
  if (!type) throw new TypeError('element() needs a type.')

  attributes = attributes || {}
  children = (children || []).reduce(reduceChildren, [])

  let key = typeof attributes.key === 'string' || typeof attributes.key === 'number'
    ? attributes.key
    : undefined

  delete attributes.key

  if (typeof type === 'object') {
    return createThunkElement(type, key, attributes, children)
  }

  if (typeof type === 'function') {
    return createThunkElement({render: type, ...type}, key, attributes, children)
  }

  return {
    attributes,
    children,
    type,
    key
  }
}

/**
 * Cleans up the array of child elements.
 * - Flattens nested arrays
 * - Converts raw strings and numbers into vnodes
 * - Filters out undefined elements
 */

function reduceChildren (children, vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    children.push(createTextElement(vnode))
  } else if (vnode === null) {
    children.push(createEmptyElement())
  } else if (Array.isArray(vnode)) {
    children = [...children, ...(vnode.reduce(reduceChildren, []))]
  } else if (typeof vnode === 'undefined') {
    throw new Error(`vnode can't be undefined. Did you mean to use null?`)
  } else {
    children.push(vnode)
  }
  return children
}

/**
 * Text nodes are stored as objects to keep things simple
 */

export function createTextElement (text) {
  return {
    type: '#text',
    nodeValue: text
  }
}

/**
 * Text nodes are stored as objects to keep things simple
 */

export function createEmptyElement () {
  return {
    type: '#empty'
  }
}

/**
 * Lazily-rendered virtual nodes
 */

export function createThunkElement (component, key, props, children) {
  return {
    type: '#thunk',
    children,
    props,
    component,
    key
  }
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
 * Is a vnode an empty placeholder?
 */

export let isEmpty = (node) => {
  return node.type === '#empty'
}

/**
 * Determine if two virtual nodes are the same type
 */

export let isSameThunk = (left, right) => {
  return isThunk(left) && isThunk(right) && left.component === right.component
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
 * Check if an attribute should be rendered into the DOM.
 */

export function isValidAttribute (value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'function') return false
  if (value === '') return true
  if (value === undefined) return false
  if (value === null) return false
  return true
}

/**
 * Create a node path, eg. (23,5,2,4) => '23.5.2.4'
 */

export let createPath = (...args) => {
  return args.join('.')
}
