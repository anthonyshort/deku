/**
 * Imports
 */

import handleActions from '@f/handle-actions'
import replace from '@f/reduce-replace'
import {urlDidUpdate} from '../actions'

/**
 * Url reducer
 */

const urlReducer = handleActions({
  [urlDidUpdate]: replace()
}, '/')

/**
 * Exports
 */

export default urlReducer
