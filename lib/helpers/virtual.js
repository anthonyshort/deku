import type from 'component-type'
import map from 'fast.js/map'

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

export function keyMapReducer (child, i) {
  var hasKey = child && child.attributes && child.attributes.key != null
  return {
    key: hasKey ? child.attributes.key : i,
    node: child
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
  return map(children, keyMapReducer)
}