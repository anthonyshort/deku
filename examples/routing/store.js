/**
 * Imports
 */

import {createStore, applyMiddleware} from 'redux'
import location from 'redux-effects-location'
import events from 'redux-effects-events'
import fetch from 'redux-effects-fetch'
import effects from 'redux-effects'
import logger from 'redux-logger'
import reducer from './reducer'
import multi from 'redux-multi'

/**
 * Store
 */

const middleware = [
  multi,
  effects,
  fetch,
  events(),
  location()
]

function configureStore (initialState) {
  return applyMiddleware(...middleware)(createStore)(reducer, initialState)
}

/**
 * Exports
 */

export default configureStore
