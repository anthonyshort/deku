/**
 * Imports
 */

import MainLayout from '../layouts/main'
import element from 'virtex-element'
import Nav from '../nav'

/**
 * Render
 */

function render () {
  return (
    <MainLayout nav={<Nav />}>
      <div>Hello World</div>
    </MainLayout>
  )
}

/**
 * Exports
 */

export default render
