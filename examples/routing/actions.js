/**
 * Imports
 */

import {bindUrl} from 'redux-effects-location'
import {fetch} from 'redux-effects-fetch'
import {bind} from 'redux-effects'

/**
 * Vars
 */

const jsonServerUrl = 'http://jsonplaceholder.typicode.com'
const postsUrl = jsonServerUrl + '/posts'

/**
 * Action Types
 */

const URL_DID_CHANGE = 'URL_DID_CHANGE'
const POSTS_DID_LOAD = 'POSTS_DID_LOAD'
const POSTS_ARE_LOADING = 'POSTS_ARE_LOADING'

/**
 * Actions
 */

function initializeApp () {
  return [
    bindUrl(urlDidChange)
  ]
}

function urlDidChange (url) {
  return {
    type: URL_DID_CHANGE,
    payload: url
  }
}

function fetchPosts () {
  return [
    bind(fetch(postsUrl), postsDidLoad),
    postsAreLoading()
  ]
}

function postsAreLoading () {
  return {
    type: POSTS_ARE_LOADING
  }
}

function postsDidLoad (posts) {
  return {
    type: POSTS_DID_LOAD,
    payload: posts
  }
}

/**
 * Exports
 */

export default {
  // Action creators
  initializeApp,
  fetchPosts,

  // Action types
  URL_DID_CHANGE,
  POSTS_DID_LOAD
}
