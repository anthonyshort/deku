/**
 * Imports
 */

import element from 'virtex-element'

/**
 * Render
 */

function render ({props}) {
  const {nav, children} = props

  return (
    <div>
      <div>
        {nav}
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}

/**
 * Exports
 */

export default render
