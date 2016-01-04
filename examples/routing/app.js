/**
 * Imports
 */

import {initializeApp} from './actions'
import element from 'virtex-element'
import router from './router'

/**
 * Before mount
 */

function beforeMount () {
  return initializeApp()
}

/**
 * Render
 */

function render ({props}) {
  return router(props.url || '/', props)
}

/**
 * Exports
 */

export default {
  beforeMount,
  render
}
