# Context

Context is an object you can set when you call render. It will be accessible from every component in the tree. Unlike React you can't modify the context within the tree.

You can use `context` to:

* Access your Redux state throughout the tree.
* Pass in `window` properties, like the size of the browser window.
* View device information like the user agent, or the orientation.
* Set global theme variables.
* Store local state for components using their `path` as the key.

There are some things to remember when using `context`:

* Context should be **immutable**. Never mutate the object directly. The renderer can perform additional optimizations if you use a different object each time. If you're using Redux, your state should be immutable anyway. You can also use a library to help with immutable structures like [Immutable.js], [Mori] or [Scour].
* Context can't be modified by components. There's no `getChildContext`.

[Immutable.js]: https://github.com/facebook/immutable-js
[Mori]: https://github.com/swannodette/mori
[Scour]: http://ricostacruz.com/scour/

## Example

We can access the `context` on the model:

```js
function render ({ context }) {
  return <div style="background-color:${context.theme.background}">Hi</div>
}

export default {
  render
}
```

Your context object might look something like this:

```js
let context = {
  theme: {
    background: 'red'
  },
  device: {
    width: 1000,
    height: 1000,
    orientation: 'landscape'
  },
  browser: {
    type: 'IE',
    version: 10
  },
  collections: {
    todos: [],
    projects: []
  },
  user: {
    name: 'Anthony Short',
    username: 'anthoney'
  }
}
```

Which you can set when you call [`render`](../api/dom):

```js
render(<App />, context)
```

## How do I change context and re-render?

Context can change in a few ways. You should listen for changes at the top level of your application rather than within components where possible. To change any type of context value from within components, you should trigger actions using `dispatch`.

* You can listen to your Redux store using `subscribe`
* You can listen for `window` events like `resize`
* Trigger actions using the `dispatcher`

The easiest way to use context is to use the Redux state. It's almost guaranteed to be immutable and you can easily keep `window` and device information in your Redux store.

```js
render(<App />, store.getState())
```

You would modify context by dispatching actions and reducing them with Redux:

```js
function render ({ dispatch }) {
  return <button onClick={resize(dispatch, 1000, 500)}>Resize</button>
}

function resize (dispatch, width, height) {
  return () => dispatch({
    type: 'RESIZE',
    width,
    height
  })
}

export default {
  render
}
```
