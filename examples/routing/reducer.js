/**
 * Imports
 */

import {
  URL_DID_CHANGE,
  POSTS_DID_LOAD,
  POSTS_ARE_LOADING
} from './actions'

/**
 * Reducer
 */

function reducer (state, action) {
  switch (action.type) {
    case URL_DID_CHANGE: {
      return {
        ...state,
        url: action.payload
      }
    }
    case POSTS_ARE_LOADING: {
      return {
        ...state,
        postsAreLoading: true
      }
    }
    case POSTS_DID_LOAD: {
      return {
        ...state,
        posts: action.payload,
        postsAreLoading: false
      }
    }
    default: {
      return state
    }
  }
}

/**
 * Exports
 */

export default reducer
