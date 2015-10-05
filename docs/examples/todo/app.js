/** @jsx element */

import element from 'dekujs/virtual-element'
import List from './list'

// Optionally set prop types that will validate
// whenever props are changed
let propTypes = {
  items: {
    type: 'array'
  }
}

// Render the list
function render (component) {
  let {props,state} = component

  return (
    <div class="App">
      <h1>My Todos</h1>
      <List items={props.items} />
    </div>
  )
}

export default {propTypes,render}
