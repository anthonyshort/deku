import type from 'component-type'
import reduce from 'fast.js/reduce'

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
 * For reducing an array of vnodes into an object using the key attribute
 */

export function keyMapReducer (acc, child, i) {
  if (child && child.attributes && child.attributes.key != null) {
    acc[child.attributes.key] = {
      vnode: child,
      index: i
    }
  } else {
    acc[i] = {
      vnode: child,
      index: i
    }
  }
  return acc
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
 * Check if two vnodes are actually the same
 */

export function isSame (left, right) {
  return left.attributes.key === right.attributes.key
}

/**
 * Get the keys for an array of vnode
 */

export function keys (children) {
  return reduce(children, keyMapReducer, {})
}