import {isText, groupByKey} from './utils'
import dift, * as diffActions from 'dift'
import Type from 'union-type'
let Any = () => true

/**
 * Patch actions
 */

export let Actions = Type({
  setAttribute: [String, Any, Any],
  removeAttribute: [String, Any],
  insertChild: [Any, Number],
  replaceChild: [Any, Any, Number],
  removeChild: [Number],
  updateChild: [Number, Array],
  updateChildren: [Array],
  insertBefore: [Number],
  replaceNode: [Any, Any],
  removeNode: [Any],
  sameNode: []
})

/**
 * Diff two attribute objects and return an array of actions that represent
 * changes to transform the old object into the new one.
 */

export function diffAttributes (previous, next) {
  let { setAttribute, removeAttribute } = Actions
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

export function diffChildren (previous, next) {
  let { insertChild, updateChild, removeChild, insertBefore, updateChildren } = Actions
  let { CREATE, UPDATE, MOVE, REMOVE } = diffActions
  let previousChildren = groupByKey(previous.children)
  let nextChildren = groupByKey(next.children)
  let key = a => a.key
  let changes = []

  function effect (type, prev, next, pos) {
    switch (type) {
      case CREATE: {
        changes.push(insertChild(next.item, pos))
        break
      }
      case UPDATE: {
        let actions = diffNode(prev.item, next.item)
        if (actions.length > 0) {
          changes.push(updateChild(prev.index, actions))
        }
        break
      }
      case MOVE: {
        let actions = diffNode(prev.item, next.item)
        actions.push(insertBefore(pos))
        changes.push(updateChild(prev.index, actions))
        break
      }
      case REMOVE: {
        changes.push(removeChild(prev.index))
        break
      }
    }
  }

  dift(previousChildren, nextChildren, effect, key)

  return updateChildren(changes)
}

/**
 * Compare two virtual nodes and return an array of changes to turn the left
 * into the right.
 */

export function diffNode (prev, next) {
  let changes = []
  let {replaceNode, setAttribute, sameNode, removeNode} = Actions

  // No left node to compare it to
  // TODO: This should just return a createNode action
  if (prev === null || prev === undefined) {
    throw new Error('Left node must not be null or undefined')
  }

  // Bail out and skip updating this whole sub-tree
  if (prev === next) {
    changes.push(sameNode())
    return changes
  }

  // Remove
  if (prev != null && next == null) {
    changes.push(removeNode(prev))
    return changes
  }

  // Replace
  if (prev.type !== next.type) {
    changes.push(replaceNode(prev, next))
    return changes
  }

  // Text
  if (isText(next)) {
    if (prev.nodeValue !== next.nodeValue) {
      changes.push(setAttribute('nodeValue', next.nodeValue, prev.nodeValue))
    }
    return changes
  }

  changes = diffAttributes(prev, next)
  changes.push(diffChildren(prev, next))

  return changes
}
