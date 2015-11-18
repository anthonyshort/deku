import {getKey, nodeType} from './utils'
import * as actions from './actions'
import dift from 'dift'

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
      changes.push(updateAttribute(name, nextValue, previousValue))
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
  let { insertChild, updateChild, moveChild, removeChild } = actions
  let { CREATE, UPDATE, MOVE, REMOVE } = dift
  let key = a => a.key

  dift(previous, next, (type, prev, next) => {
    switch (type) {
      case CREATE: {
        changes.push(insertChild(next.item, next.index))
        break
      }
      case UPDATE: {
        let actions = diffNode(prev.item, next.item, path + '.' + prev.index)
        changes.push(updateChild(actions, prev.index))
        break
      }
      case MOVE: {
        let actions = diffNode(prev.item, next.item, path + '.' + prev.index)
        changes.push(updateChild(actions, prev.index))
        changes.push(moveChild(prev.index, next.index))
        break
      }
      case REMOVE: {
        changes.push(removeChild(prev.item, prev.index))
        break
      }
    }
  }, key)

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
