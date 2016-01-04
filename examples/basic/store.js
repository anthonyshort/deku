import {createStore} from 'redux'
import reducer from './reducer'

/**
 * Store
 */

const store = createStore(reducer, {counter: 0})

/**
 * Exports
 */

export default store
