import {dom} from '../../src'
import {view, update, init} from './app'

/**
 * The dom object contains all the functions for rendering to the DOM.
 */

const {createRenderer} = dom

/**
 * Create a DOM renderer for vnodes. It accepts a dispatch function as
 * a second parameter to handle all actions from the UI.
 */

let render = createRenderer(document.body)

/**
 * Update the UI with the latest state.
 */

function main (state) {
  let vnode = view(state, action => {
    let nextState = update(state, action)
    main(nextState)
  })
  render(vnode)
}

/**
 * Initial render
 */

main(init())
