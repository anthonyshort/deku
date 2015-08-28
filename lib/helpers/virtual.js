import type from 'component-type'
import map from 'fast.js/map'
import reduce from 'fast.js/reduce'
import forEach from 'fast.js/forEach'
import diff from 'f-xyz-diff'
import {curry} from 'ramda'

/**
 * Returns the type of a virtual node
 *
 * @param  {Object} node
 * @return {String}
 */

export function nodeType (node) {
  var v = type(node)
  if (v === 'null' || node === false) return 'empty'
  if (v !== 'object') return 'text'
  if (type(node.type) === 'string') return 'element'
  return 'component'
}

/**
 * Given two nodes, determine the type of patch operation
 */

export function patchType (left, right) {
  var leftType = nodeType(left)
  var rightType = nodeType(right)
  if (left === right) {
    return 'skip'
  } else if (leftType === 'empty' && rightType !== 'empty') {
    return 'create'
  } else if (leftType !== rightType) {
    return 'replace'
  } else if (rightType === 'text') {
    return 'updateText'
  } else if (rightType === 'empty') {
    return 'skip'
  } else if (left.type !== right.type) {
    return 'replace'
  } else if (rightType === 'element') {
    return 'updateElement'
  } else if (rightType === 'component') {
    return 'updateComponent'
  }
}

/**
 * Checks to see if one tree path is within
 * another tree path. Example:
 *
 * 0.1 vs 0.1.1 = true
 * 0.2 vs 0.3.5 = false
 *
 * @param {String} target
 * @param {String} path
 *
 * @return {Boolean}
 */

export function isWithinPath (parent, child) {
  return child.indexOf(parent + '.') === 0
}

/**
 * Get the keys for an array of vnode
 */

export function keys (children) {
  return map(children, (child, i) => {
    var key = child && child.attributes && child.attributes.key
    return {
      key: key || i,
      node: child
    }
  })
}

/**
 * Compare two virtual nodes for changes
 */

export function changes (prev, next) {
  let left = keys(prev.children)
  let right = keys(next.children)
  let {NOT_MODIFIED, CREATED, MOVED, DELETED} = diff

  let rightKeys = reduce(right, (acc, item) => {
    acc[item.key] = item.node
    return acc
  }, {})

  return map(diff(left, right, 'key'), change => {
    let {state, oldIndex, newIndex, item} = change
    let action = {
      nodes: [item.node, rightKeys[item.key]],
      indexes: [oldIndex, newIndex]
    }
    switch (state) {
      case MOVED:
        action.type = 'moved'
        break
      case DELETED:
        action.type = 'removed'
        break
      case CREATED:
        action.type = 'created'
        break
      case NOT_MODIFIED:
        action.type = 'updated'
        break
    }
    return action
  })
}

/**
 * Render a component vnode
 */

export function renderComponent (component, ...args) {
  return typeof component === 'function' ?
    component(...args) :
    component.render(..args)
}

/**
 * Trigger a hook on a component
 */

export function trigger (component, name, args = []) {
  var hook = component[name]
  if (typeof hook === 'function') {
    hook(...args)
  }
}
