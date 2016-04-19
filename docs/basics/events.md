# Event handlers

You can add event handlers using attributes. There are a number of attributes that Deku will recognize for you. These are treated as special attributes:

```js
function render () {
  return <button onClick={save}>Submit</button>
}

function save (event) {
  // event = MouseClick dom event
}

export { render }
```

These handlers will be added and removed for you. With each render, if the handler doesn't match the new handler, they are swapped.

## Usage with Redux

Redux is the preferred state management package for Deku. As `dispatch` is passed down to every component's [render](components.md) method, you can create a curried function for your event handlers to allow them to access this function.

```js
let save = dispatch => event => {
  dispatch({
    type: 'SAVED'
  })
}

function render ({ dispatch }) {
  return <button onClick={save(dispatch)}>Submit</button>
}

export { render }
```

```js
// Assuming you passed the `dispatch` function to dom.createRenderer like below,
// your components should be able to access this `dispatch` function like above.
let render = dom.createRenderer(document.body, store.dispatch)
render(<MyComponent />, store.getState())
```

## How do I delegate events?

The renderer doesn't automatically delegate events. To delegate events you can just add a handler on the parent element:

```js
let render = model => {
  return (
    <ul onClick={onClick}>
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  )
}

let onClick = event => {
  if (event.target.tagName === 'LI') {
    console.log('clicked')
  }
}
```

You can probably find some libraries on npm to make this easier too.

## How do I access my model in an event handler?

If you want to send extra information to the handler you can curry or partially apply the handler function. We don't provide any special parameters to the event handlers, so it's as if you called `el.addEventListener` directly.

```js
let render = model => {
  return <div onClick={onClick(model)}>Hello World</div>
}

let onClick = model => event => {
  console.log(model, event)
}
```

Because the handler is changing the function on every render, it will add the new event listener each time like you'd expect.
