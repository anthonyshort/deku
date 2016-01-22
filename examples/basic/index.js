import {createApp} from '../../src'
import {view, update, init} from './app'

/**
 * Create a DOM renderer for vnodes. It accepts a dispatch function as
 * a second parameter to handle all actions from the UI.
 */

let render = createApp(document.body)

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
