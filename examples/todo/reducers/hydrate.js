/**
 * Imports
 */

import handleActions from '@f/handle-actions'
import {hydrateState} from '../actions'

/**
 * Hydrate state from local storage
 */

const hydrateReducer = handleActions({
  [hydrateState]: (oldState, newState) => ({...oldState, ...newState})
})

/**
 * Exports
 */

export default hydrateReducer
