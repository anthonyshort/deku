# Dispatcher

The `dispatcher` is a function you can pass to `createRenderer` that will handle actions that are triggered within the UI. You will typically use a library like Redux to handle reducing actions into state and side-effects.

* All actions a user or program trigger should be dispatched
* Side-effects, like DOM manipulation, should also be dispatched as actions and handled by this function
* Access the dispatch function within components as `model.dispatch`

## Example

Here's a custom `dispatch` function being passed into the `createRenderer` function.

```js
// Custom dispatch method
let render = createRenderer(document.body, action => {
  // action.type = 'ADD_TODO'
})

// Using Redux
let render = createRenderer(document.body, store.dispatch)
```

You will be able to access `dispatch` from any component as `model.dispatch`:

```js
function render ({ dispatch }) {
  return <button onClick={addTodo(dispatch)}>Add Todo</button>
}

function addTodo (dispatch) {
  return event => {
    dispatch({
      type: 'ADD_TODO'
    })
  }
}

export default {
  render
}
```
