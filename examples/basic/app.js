import {element} from '../../src'

/**
 * App
 */

function app (state) {
  return element('div', {onClick: increment}, 'Counter: ' + state.counter)
}

function increment () {
  return {
    type: 'INCREMENT'
  }
}

/**
 * Exports
 */

export default app
