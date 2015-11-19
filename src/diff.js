import * as actions from './actions'
import {getKey, isText, isThunk, isSameThunk, createPath} from './utils'
import dift, * as diffActions from 'dift'

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

export function diffAttributes (previous, next) {
  let { setAttribute, removeAttribute } = actions
  let changes = []
  let pAttrs = previous.attributes
  let nAttrs = next.attributes

  for (let name in nAttrs) {
    if (nAttrs[name] !== pAttrs[name]) {
      changes.push(setAttribute(name, nAttrs[name], pAttrs[name]))
    }
  }

  for (let name in pAttrs) {
    if (!(name in nAttrs)) {
      changes.push(removeAttribute(name, pAttrs[name]))
    }
  }

  return changes
}

/**
 * Compare two arrays of virtual nodes and return an array of actions
 * to transform the left into the right. A starting path is supplied that use
 * recursively to build up unique paths for each node.
 */

export function diffChildren (previous, next, path = '0') {
  let { insertChild, updateChild, removeChild, insertBefore } = actions
  let { CREATE, UPDATE, MOVE, REMOVE } = diffActions
  let previousChildren = groupByKey(previous.children)
  let nextChildren = groupByKey(next.children)
  let key = a => a.key
  let changes = []

  function effect (type, prev, next, idx) {
    switch (type) {
      case CREATE: {
        changes.push(
          insertChild(next.item, createPath(path, next.key), next.index)
        )
        break
      }
      case UPDATE: {
        let path = createPath(path, prev.key)
        let actions = diffNode(prev.item, next.item, path, prev.index)
        if (actions.length > 0) {
          changes.push(
            updateChild(prev.item, prev.index, actions)
          )
        }
        break
      }
      case MOVE: {
        let path = createPath(path, next.key)
        let actions = diffNode(prev.item, next.item, path, next.index)
        changes.push(insertBefore(prev, prev.index, next.index))
        if (actions.length > 0) {
          changes.push(updateChild(prev, next.index, actions))
        }
        break
      }
      case REMOVE: {
        changes.push(
          removeChild(prev, prev.index)
        )
        break
      }
    }
  }

  dift(previousChildren, nextChildren, effect, key)

  return changes
}

/**
 * Compare two virtual nodes and return an array of changes to turn the left
 * into the right.
 */

export function diffNode (prev, next, path = '0', index = 0) {
  let changes = []
  let {updateThunk, replaceChild, setAttribute} = actions

  // Bail out and skip updating this whole sub-tree
  if (prev === next) {
    return changes
  }

  // Replace
  if (prev.type !== next.type) {
    changes.push(replaceChild(prev, next, index))
    return changes
  }

  // Text
  if (isText(next)) {
    if (prev.nodeValue !== next.nodeValue) {
      changes.push(setAttribute('nodeValue', next.nodeValue, prev.nodeValue))
    }
    return changes
  }

  // Thunk
  if (isThunk(next)) {
    if (isSameThunk(prev, next)) {
      changes.push(updateThunk(next, prev, path, index))
    } else {
      changes.push(replaceChild(prev, next, path, index))
    }
    return changes
  }

  changes = changes
    .concat(diffAttributes(prev, next))
    .concat(diffChildren(prev, next, path))

  return changes
}
