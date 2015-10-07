/** @jsx element */

import element from 'dekujs/virtual-element'

let propTypes = {
  'item': {
    'type': 'object'
  },
  'remove': {
    source: 'removeTodo'
  }
}

function render (component) {
  let {props,state} = component
  let {item,remove} = props

  function onRemove () {
    remove(item)
  }

  return (
    <div class="Todo">
      {item.text}
      <span onClick={onRemove}>Remove</span>
    </div>
  )
}

export default {propTypes,render}
