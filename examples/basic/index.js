import {dom} from '../../src'
import app from './app'
import store from './store'

/**
 * The dom object contains all the functions for rendering to the DOM.
 */

const {createRenderer} = dom

/**
 * Everything will be rendered inside this element.
 */

let container = document.querySelector('#app')

/**
 * Create a DOM renderer for vnodes. It accepts a dispatch function as
 * a second parameter to handle all actions from the UI.
 */

let render = createRenderer(container, store.dispatch)

/**
 * Update the UI with the latest state.
 */

let update = state => render(app(state))

/**
 * Whenever the store changes, update the UI.
 */

store.subscribe(() => update(store.getState()))

/**
 * Initial render
 */

update(store.getState())
