/**
 * Imports
 */

import element from 'virtex-element'

/**
 * Render
 */

function render ({props}) {
  const {url} = props

  return (
    <div>
      <a href='/'>Home</a>
      <a href='/posts'>Posts</a>
      <a href='/users'>Users</a>
    </div>
  )
}

/**
 * Exports
 */

export default render
