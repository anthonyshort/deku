/**
 * Imports
 */

import {handleOnce} from 'redux-effects-events'
import configureStore from './store'
import element from 'virtex-element'
import vdux from '../../src'
import App from './app'

/**
 * Setup store
 */

const store = configureStore({})

/**
 * Initialize
 */

store.dispatch(handleOnce('domready', () => {
  vdux(
    store,
    state => <App {...state} />,
    document.body
  )
}))
