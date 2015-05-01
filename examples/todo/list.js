import Todo from './todo'

// These are shared across all instances on the page
export let defaultProps = {
  items: []
}

// Optionally set prop types that will validate
// whenever props are changed
export let propTypes = {
  items: {
    type: 'array'
  }
}

// Render the list
export function render (component) {
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