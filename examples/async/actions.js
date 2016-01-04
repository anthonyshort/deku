/**
 * Imports
 */

import {bind} from 'redux-effects'
import {fetch} from 'redux-effects-fetch'

/**
 * Actions
 */

const REQUESTING_POSTS = 'REQUESTING_POSTS'
const RECEIVED_POSTS = 'RECEIVED_POSTS'
const SELECT_REDDIT = 'SELECT_REDDIT'
const INVALIDATE_REDDIT = 'INVALIDATE_REDDIT'

function requestPosts (reddit) {
  return [
    requestingPosts(),
    bind(
      fetch(`http://www.reddit.com/r/${reddit}.json`),
      json => receivedPosts(json.data.children.map(child => child.data))
    )
  ]
}

function requestingPosts () {
  return {
    type: REQUESTING_POSTS
  }
}

function receivedPosts (posts) {
  return {
    type: RECEIVED_POSTS,
    posts
  }
}

function selectReddit (reddit) {
  return {
    type: SELECT_REDDIT,
    reddit
  }
}

/**
 * Exports
 */

export {
  // Action creators
  requestPosts,
  selectReddit,

  // Action types
  REQUESTING_POSTS,
  RECEIVED_POSTS,
  SELECT_REDDIT,
}
