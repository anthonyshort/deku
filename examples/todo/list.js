import Todo from './todo'

// These are shared across all instances on the page
let defaultProps = {
  items: []
}

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

  let items = props.items.map(function (item) {
    return <Todo item={item} />
  })

  return (
    <div class="TodoList">
      {items}
    </div>
  )
}

export default {defaultProps,propTypes,render}
