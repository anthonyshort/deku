# Components

Components are a way to define logical, re-usable pieces of your interface - tabs, buttons, forms. In Deku, components are just a special type of virtual element that is not rendered until it's needed. Internally, components are known as "thunks". This means that only the minimal number of virtual elements need to be re-created and patched on each render.

In addition to providing a performance boost, you are able to hook into "lifecycle events" when a component is created, updated, or removed.

Components are:

* Plain objects with at least `render` function;
* Able to provide a performance boost by caching the result of each render;
* Uniquely identifiable using the `path` value, allowing you to store local state;
* Able to trigger actions when they are created, updated, or removed;
* Used like custom elements within your app

Unlike React, components in Deku are completely stateless, there's no `setState` function or `this` used.

## Example

Here's a simple `<App />` component:

```js
function render ({ props, children, context, path }) {
  return (
    <div class="App" hidden={props.hidden} color={context.theme.color}>
      {children}
    </div>
  )
}

function onCreate ({ props, dispatch }) {
  dispatch({
    type: 'APP_STARTED'
  })
}

function onRemove ({ props, dispatch }) {
  dispatch({
    type: 'APP_STOPPED'
  })
}

export default {
  render,
  onCreate,
  onRemove
}
```

To use this component within other components, you simply import and compose it:

```js
import App from './app'

function render (model) {
  return <App hidden={false} />
}

export {
  render
}
```

And you can do the same at top-level using `render`, while also setting the `context`:

```js
render(<App hidden={false} />, {
  theme: {
    color: 'red'
  }
})
```

## Model

The model is passed into the Component function and is contains the state that you can use to create virtual nodes. The model is immutable

```js
function render ({ props }) {
  return <p color={props.color}>Hello World</p>
}
```

### Properties

#### `props`

The values passed into your component as virtual element attributes. For example, passing these attributes into the component:

```js
<App count={5} type="tasks" />
```

will yield this as `model.props`:

```json
{
  "count": 5,
  "type": "tasks"
}
```

#### `children`

The child nodes that are passed to the component.

```js
<App>
  <Sidebar />
  <Content>Hello World</Content>
</App>
```

The `children` property will always be an array:

```js
[
  <Sidebar />,
  <Content>Hello World</Content>
]
```

You can use this to render the passed in nodes somewhere within the rendered DOM.

```js
function render ({ children }) {
  return <div>{children}</div>
}
```

#### `path`

The unique path to the component within the entire component tree.

```js
function render ({ path }) {
  return <a onClick={updateState(path)}>Save</a>
}
```

Paths in a tree are strings, like `0.1.5.2`. Each number represents the index of the node in the parent node, so you can use this to find a node within a tree. If a node within that path has a `key` attribute, we use that instead of the index so that the path is stable even if any elements move around.

#### `context`

An object that is available to every component in the tree.
