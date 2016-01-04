/**
 * Imports
 */

import MainLayout from '../layouts/main'
import element from 'virtex-element'

/**
 * Render
 */

function render ({props}) {
  const {url} = props

  return (
    <MainLayout nav={<Nav />}>
      <div>
        <h2>Url '{url}' does not exist</h2>
      </div>
    </MainLayout>
  )
}

/**
 * Exports
 */

export default render
