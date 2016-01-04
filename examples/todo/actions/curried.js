/**
 * Imports
 */

import curryAll from '@f/curry-all'
import * as actions from '.'

/**
 * Curried actions
 */

const {
  addTodo,
  removeTodo,
  setTodoText,
  setImportant,
  setCompleted,
  setAllCompleted,
  clearCompleted,
  persistTodos,
  initializeApp
} = curryAll(actions)

/**
 * Exports
 */

export {
  addTodo,
  removeTodo,
  setTodoText,
  setImportant,
  setCompleted,
  setAllCompleted,
  clearCompleted,
  persistTodos,
  initializeApp
}
