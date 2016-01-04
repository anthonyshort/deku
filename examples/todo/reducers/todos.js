/**
 * Imports
 */

import composeReducers from '@f/compose-reducers'
import handleActions from '@f/handle-actions'
import rfilter from '@f/reduce-filter'
import reduceKey from '@f/reduce-key'
import rmap from '@f/reduce-map'
import concat from '@f/concat'
import {
  addTodo, removeTodo, setTodoText, setImportant,
  setCompleted, setAllCompleted, clearCompleted
} from '../actions'

/**
 * Todo list reducer
 */

const todoReducer = handleActions({
  [setTodoText]: updateProp('text'),
  [setImportant]: updateProp('important'),
  [setCompleted]: updateProp('completed')
})

// Note that these are action creator functions being
// used as keys. They have an overriden .toString()
// property that makes this work.
//
// Read more here:
// https://github.com/micro-js/create-action
const todosReducer = composeReducers(
  reduceKey(getIndex, todoReducer),
  handleActions({
    [addTodo]: concat,
    [removeTodo]: rfilter((todo, {idx}, i) => i !== idx),
    [setAllCompleted]: rmap(updateProp('completed')),
    [clearCompleted]: rfilter(notCompleted)
  })
)

/**
 * Helpers
 */

function updateProp (prop) {
  return (item, payload) => ({...item, [prop]: payload[prop]})
}

function notCompleted (todo) {
  return !todo.completed
}

function getIndex (state, {payload}) {
  return payload && payload.idx
}

/**
 * Exports
 */

export default todosReducer
