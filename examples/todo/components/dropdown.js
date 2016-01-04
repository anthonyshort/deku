/**
 * Imports
 */

import {handleOnce, unhandle} from 'redux-effects-events'
import combineReducers from '@f/combine-reducers'
import handleActions from '@f/handle-actions'
import createAction from '@f/create-action'
import element from 'virtex-element'
import {bind} from 'redux-effects'

/**
 * initialState
 */

function initialState () {
  return {
    open: false
  }
}

/**
 * beforeUpdate
 */

function beforeUpdate (prev, next) {
  if (!prev.state.open && next.state.open) {
    return bindCloseHandler(next.local)
  } else if(prev.state.open && !next.state.open) {
    return unbindCloseHandler(next.local, next.state.handlerId)
  }
}

/**
 * Render
 */

function render ({children, state}) {
  const {open} = state

  return (
    <ul class='dropdown' style={{display: open ? 'block' : 'none'}}>
      {children.map(item => <li>{item}</li>)}
    </ul>
  )
}

/**
 * Local actions
 */

const toggle = createAction('TOGGLE')
const close = createAction('CLOSE')
const setHandlerId = createAction('SET_HANDLER_ID')

/**
 * Reducer
 */

const reducer = combineReducers({
  handlerId: handleActions({
    [setHandlerId]: (state, id) => id
  }),
  open: handleActions({
    [toggle]: state => !state,
    [close]: () => false
  })
})

/**
 * Action helpers
 */

function bindCloseHandler (local) {
  return bind(
    handleOnce('click', local(close)),
    local(setHandlerId)
  )
}

function unbindCloseHandler (local, id) {
  return [
    unhandle('click', id),
    local(setHandlerId)(null)
  ]
}

/**
 * Exports
 */

export default {
  initialState,
  beforeUpdate,
  render,
  reducer,
  toggle
}
