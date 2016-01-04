/**
 * Imports
 */

import NotFound from './components/pages/notFound'
import Posts from './components/pages/posts'
import Home from './components/pages/home'
import element from 'virtex-element'
import enroute from 'enroute'

/**
 * Routes
 */

const router = enroute({
  '/': home,
  '/posts': posts,
  '*': notFound
})

/**
 * Pages
 */

function home (params, props) {
  return <Home {...props} />
}

function posts (params, props) {
  return <Posts posts={props.posts} />
}

function notFound () {
  return <NotFound />
}

/**
 * Exports
 */

export default router
