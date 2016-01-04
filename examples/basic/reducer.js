/**
 * Reducer
 */

function reducer (state, action) {
  if (action.type === 'INCREMENT') {
    state = {...state, counter: state.counter + 1}
  }

  return state
}

/**
 * Exports
 */

export default reducer
