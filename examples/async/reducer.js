/**
 * Imports
 */

import {SELECT_REDDIT, RECEIVED_POSTS, REQUESTING_POSTS} from './actions'

/**
 * Reducer
 */

function reducer (state, action) {
  switch (action.type) {
    case SELECT_REDDIT:
      return {
        ...state,
        reddit: action.reddit
      }
    case REQUESTING_POSTS:
      return {
        ...state,
        loading: true
      }
    case RECEIVED_POSTS:
      return {
        ...state,
        loading: false,
        posts: action.posts,
        lastUpdated: action.dispatchedAt
      }
  }

  return state
}

/**
 * Exports
 */

export default reducer
