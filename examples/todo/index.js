/**
 * Imports
 */

import {handleOnce} from 'redux-effects-events'
import {initializeApp} from './actions'
import element from 'virtex-element'
import createStore from './store'
import vdux from '../../src'
import App from './app'

/**
 * Setup store
 */

const store = createStore({
  todos: [],
  app: {}
})

/**
 * App
 */

store.dispatch(handleOnce('domready', () => {
  store.dispatch(initializeApp())
  vdux(
    store,
    state => <App todos={state.todos} url={state.url} />,
    document.body
  )
}))
