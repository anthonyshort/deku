# Event handlers

You can add event handlers using attributes. There are a number of attributes that Deku will recognize for you. These are treated as special attributes:

```js
let save = dispatch => event => {
  dispatch({
    type: 'SAVED'
  })
}

let render = model => {
  return <button onClick={save(dispatch)}>Submit</button>
}

export default {
  render
}
```

These handlers will be added and removed for you. With each render, if the handler doesn't match the new handler, they are swapped.

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

## How do I access my the model in an event handler?

If you want to send extra information to the handler you can curry or partially apply the handler function. We don't provide any special parameters to the event handlers, so it's as if you called `el.addEventListener` directly.

```js
let render = model => {
  return <div onClick={onClick(model)}>Hello World</div>
}

let onClick = model => event => {
  console.log(model, e)
}
```

Because the handler is changing the function on every render, it will add the new event listener each time like you'd expect.
