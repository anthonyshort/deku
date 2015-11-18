import {groupByKey, getKey, nodeType} from './shared'
import * as actions from './actions'
import dift from 'dift'

/**
 * Diff two attribute objects and return an array of actions that represent
 * changes to transform the old object into the new one.
 */

export default function diffAttributes (previous, next) {
  let { addAttribute, updateAttribute, removeAttribute } = actions
  let changes = []

  for (let name in next) {
    let nextValue = next[name]
    let previousValue = previous[name]
    if (!(name in previous)) {
      changes.push(addAttribute(name, nextValue))
    } else if (nextValue !== previousValue) {
      changes.push(updateAttribute(name, nextValue))
    }
  }

  for (let name in previous) {
    if (!(name in next)) {
      changes.push(removeAttribute(name, previous[name]))
    }
  }

  return changes
}

/**
 * Compare two arrays of virtual nodes and return an array of actions
 * to transform the left into the right. A starting path is supplied that use
 * recursively to build up unique paths for each node.
 */

export let diffChildren = (previousChildren, nextChildren, path = '0') => {
  let changes = []
  let previous = groupByKey(previousChildren)
  let next = groupByKey(nextChildren)
  let { insertChild } = actions
  let { CREATE, UPDATE, MOVE, REMOVE } = dift

  dift(previous, next, (type, prev, next) => {
    switch (type) {
      // Add node
      case CREATE: {
        changes.push(insertChild(next.item, next.index))
        break
      }
      // Update in place
      case UPDATE: {
        changes.push({
          type: 'updateChild',
          actions: diffNode(prev.item, next.item, path + '.' + prev.index),
          index: prev.index
        })
        break
      }
      // Move + Update
      case MOVE: {
        changes.push({
          type: 'updateChild',
          actions: diffNode(prev.item, next.item, path + '.' + prev.index),
          index: prev.index
        })
        changes.push({
          type: 'moveChild',
          from: prev.index,
          to: next.index
        })
        break
      }
      // Remove Node
      case REMOVE: {
        changes.push({
          type: 'removeChild',
          index: prev.index,
          element: prev.item
        })
        break
      }
    }
  }, getKey)
  return changes
}

/**
 * Compare two virtual nodes and return an array of changes to turn the left
 * into the right.
 */

export let diffNode = (previousElement, nextElement, path = '0') => {
  let changes = []
  let {updateText, updateThunk} = actions

  // Bail out and skip updating this whole sub-tree
  if (previousElement === nextElement) {
    return changes
  }

  switch (nodeType(nextElement)) {
    case 'native':
      let attrChanges = diffAttributes(nextElement.attributes, previousElement.attributes)
      let childChanges = diffChildren(previousElement.children, nextElement.children, path)
      changes = attrChanges.concat(childChanges)
      break
    case 'text':
      changes.push(updateText(nextElement, previousElement))
      break
    case 'custom':
      changes.push(updateThunk(nextElement, previousElement, path))
      break
    default:
      throw new Error('Node type not supported')
  }

  return changes
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
