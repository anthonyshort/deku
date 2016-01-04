/**
 * Imports
 */

import composeReducers from '@f/compose-reducers'
import combineReducers from '@f/combine-reducers'
import ephemeral from 'redux-ephemeral'
import hydrateReducer from './hydrate'
import todosReducer from './todos'
import urlReducer from './url'

/**
 * Exports
 */

export default composeReducers(
  hydrateReducer,
  combineReducers({
    todos: todosReducer,
    url: urlReducer
  })
)
