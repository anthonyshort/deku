/**
 * Imports
 */

import dispatchedAt from './middleware/dispatchedAt'
import {createStore, applyMiddleware} from 'redux'
import events from 'redux-effects-events'
import component from 'virtex-component'
import fetch from 'redux-effects-fetch'
import effects from 'redux-effects'
import logger from 'redux-logger'
import reducer from './reducer'
import multi from 'redux-multi'
import dom from 'virtex-dom'

/**
 * Middleware
 */

 const middleware = [
   multi,
   dom(document),
   component,
   effects,
   events(),
   fetch,
   dispatchedAt,
   // logger
 ]

/**
 * Store
 */

function configureStore (initialState) {
  return applyMiddleware(...middleware)(createStore)(reducer, initialState)
}

/**
 * Exports
 */

export default configureStore
