/**
 * Imports
 */

import MainLayout from '../layouts/main'
import element from 'virtex-element'
import Posts from '../posts'
import Nav from '../nav'

/**
 * Render
 */

function render ({props}) {
  const {posts, postsAreLoading} = props

  return (
    <MainLayout nav={<Nav />}>
      <Posts posts={posts} />
    </MainLayout>
  )
}

/**
 * Exports
 */

export default render
