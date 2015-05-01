import List from './list'

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

  return (
    <div class="App">
      <h1>My Todos</h1>
      <List items={props.items} />
    </div>
  )
}