/**
 * Imports
 */

import {persistTodos} from '../actions'

/**
 * Persist todos to localStorage when they change
 */

function persist ({dispatch, getState}) {
  return next => action => {
    const prevState = getState()
    next(action)
    const nextState = getState()

    if (prevState !== nextState && prevState.todos !== nextState.todos) {
      dispatch(persistTodos(nextState.todos))
    }
  }
}

/**
 * Exports
 */

export default persist
