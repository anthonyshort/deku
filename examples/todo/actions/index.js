/**
 * Imports
 */

import {bind} from 'redux-effects'
import {bindUrl} from 'redux-effects-location'
import createAction from '@f/create-action'
import {setItem, getItem} from 'redux-effects-localstorage'

/**
 * Constants
 */

const localStorageKey = 'todos-vdux'

/**
 * Action creators
 */

function initializeApp () {
  return [
    hydrateTodos(),
    initializeRouter()
  ]
}

function initializeRouter () {
  return bindUrl(urlDidUpdate)
}

const urlDidUpdate = createAction('URL_DID_UPDATE')
const addTodo = createAction('TODO_ADD', text => ({text, completed: false, important: false}))
const removeTodo = createAction('TODO_REMOVE', idx => ({idx}))
const setTodoText = createAction('TODO_SET_TEXT', (idx, text) => ({idx, text}))
const setImportant = createAction('TODO_SET_IMPORTANT', (idx, important) => ({idx, important}))
const setCompleted = createAction('TODO_SET_COMPLETED', (idx, completed) => ({idx, completed}))
const setAllCompleted = createAction('SET_ALL_COMPLETED', completed => ({completed}))
const clearCompleted = createAction('CLEAR_COMPLETED')

function persistTodos (todos) {
  return setItem(localStorageKey, JSON.stringify(todos))
}

function hydrateTodos () {
  return bind(
    getItem(localStorageKey),
    todosStr => todosStr && hydrateState({todos: JSON.parse(todosStr)})
  )
}

const hydrateState = createAction('HYDRATE_STATE')

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
  initializeApp,
  hydrateState,
  urlDidUpdate
}
