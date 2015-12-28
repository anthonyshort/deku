# Model

The model is passed into the Component function and is essentially the state that you can use to create virtual nodes. The model is immutable so to make any changes to values you need modify the state somewhere else and call `render` again from the top level.

```js
function App (model) {
  return <p color={model.attributes.color}>Hello World</p>
}
```

## Properties

### `model.attributes`

The values passed into your component as virtual element attributes. For example, passing these attributes into the component:

```js
<App count={5} type="tasks" />
```

will yield this as `model.attributes`:

```json
{
  "count": 5,
  "type": "tasks"
}
```

### `model.children`

The child nodes that are passed to the component.

```js
<App>
  <Sidebar />
  <Content>Hello World</Content>
</App>
```

The `children` property will always be an array:

```jsx
[
  <Sidebar />,
  <Content>Hello World</Content>
]
```

You can use this to render the passed in nodes somewhere within the rendered DOM.

```js
function App (model) {
  return <div>{model.children}</div>
}
```

### `model.path`

The unique path to the component within the entire component tree.

```js
function App (model) {
  return <a onClick={updateState(model.path)}>Save</a>
}

function updateState (path) {
  return function (e) {
    dispatch('updateState', {
      path: path,
      value: e.target.value
    })
  }
}
```

Paths in a tree are strings, like `0.1.5.2`. Each number represents the index of the node in the parent node, so you can use this to find a node within a tree.

If a node within that path has a `key` attribute, we use that instead so that the path is stable even if any elements move around. For example, `0.1.foo.2`. This allows you to maintain some state for a component even if it moves.
