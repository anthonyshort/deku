import {h} from '../../src'

/**
 * Takes some state and returns a virtual element
 */

function view (state, dispatch) {
  return (
    h('div', {}, [
      h('div', {}, 'Counter: ' + state.count),
      h('button', {onClick: increment(dispatch)}, 'Increment'),
      h('button', {onClick: decrement(dispatch)}, 'Decrement')
    ])
  )
}

/**
 * Update the state
 */

function update (state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 10
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1
      }
  }
  return state
}

/**
 * Get the initial state
 */

function init () {
  return {
    count: 10
  }
}

/**
 * Action creators
 */

function increment (dispatch) {
  return e => dispatch({
    type: 'INCREMENT'
  })
}

function decrement (dispatch) {
  return e => dispatch({
    type: 'DECREMENT'
  })
}

export {view, update, init}
