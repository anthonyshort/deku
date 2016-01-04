/**
 * Imports
 */

import {fetchPosts} from '../actions'
import element from 'virtex-element'

/**
 * Before mount
 */

function beforeMount () {
  return fetchPosts()
}

/**
 * Render
 */

function render ({props}) {
  const {posts = []} = props

  return (
    <div>
      {
        posts.map(({title, body}) => (
          <div>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))
      }
    </div>
  )
}

/**
 * Exports
 */

export default {
  beforeMount,
  render
}
