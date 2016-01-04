/**
 * Imports
 */

import element from 'virtex-element'
import {clearCompleted} from '../actions'

/**
 * Filters
 */

const filters = {
  All: '/',
  Active: '/active',
  Completed: '/completed'
}

/**
 * Render
 */

function render ({props}) {
  const {itemsLeft = 0, completed = 0, active} = props
  const itemStr = itemsLeft === 1 ? 'item' : 'items'

  return (
    <footer id='footer' class='footer'>
      <span class='todo-count'>
        <strong>{itemsLeft}</strong> {itemStr} left
      </span>
      <ul class='filters'>
        {
          Object.keys(filters).map(key =>
            <li><a href={filters[key]} class={{selected: isSelected(key)}}>{key}</a></li>
          )
        }
      </ul>
      <button class='clear-completed' onClick={clearCompleted} style={{display: completed ? 'block' : 'none'}}>
        Clear Completed
      </button>
    </footer>
  )

  function isSelected (name) {
    return !active && name === 'All'
      || name.toLowerCase() === active
  }
}

/**
 * Exports
 */

export default render
