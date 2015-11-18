import {nodeType} from './utils'

/**
 * Determine if two virtual nodes are the same type
 */

export let isSameThunk = (left, right) => {
  return nodeType(left) === nodeType(right) === 'thunk' && left.type === right.type
}

/**
 * Is a vnode a thunk?
 */

export let isThunk = (node) => {
  return typeof node.type === 'function'
}

/**
 * Get the content for a custom element
 */

export let renderThunk = (thunk, model) => {
  return thunk.type(model)
}

/**
 * The model is used in the custom element render function.
 */

export let createModel = ({ attributes, children }, context, path) => {
  return {
    attributes,
    children,
    path,
    context
  }
}

// /**
//  * Call the onCreate hook on a Custom Element
//  */
//
// let onCreate = ({ type }, ...args) => {
//   let fn = type.onCreate
//   if (typeof fn === 'function') {
//     fn(...args)
//   }
// }
//
// /**
//  * Call the onUpdate hook on a Custom Element
//  */
//
// let onUpdate = ({ type }, ...args) => {
//   let fn = type.onUpdate
//   if (typeof fn === 'function') {
//     fn(...args)
//   }
// }
//
// /**
//  * Call onInsert hook on a Custom Element
//  */
//
// let onInsert = ({ type }, ...args) => {
//   let {onInsert} = type
//   return () => {
//     if (onInsert) {
//       onInsert(...args)
//     }
//   }
// }

/**
 * Call onRemove on an Custom Element and all nested custom elements
 */

// let onRemove = (element, ...args) => {
//   if (element.cache) {
//     walk(onRemove)(element.cache)
//   }
//   let fn = element.type.onRemove
//   if (typeof fn === 'function') {
//     fn(...args)
//   }
// }
