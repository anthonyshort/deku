# Lifecycle hooks

These are functions you can add to your component to hook into different parts of the rendering process. You can use these to manipulate the DOM in some way or trigger an action to change state. 

| Name        | Triggered                                                                | Arguments   |
|-------------|--------------------------------------------------------------------------|-------------|
| `onCreate`  | When the component is initially created                                  | `model`     |
| `onUpdate`  | After the component is re-rendered and the DOM is patched                | `model`     |
| `onRemove`  | When the DOM element has been removed from the DOM                       | `model`     |

## Example

```js
function render (model) {
  return <div>{model.props.text}</div>
}

function onCreate (model) {
  console.log('A MyComponent entity was created!')
}

export default {
  render,
  onCreate
}
```

## How do I access the DOM element?

In React, you can access the DOM element directly in the lifecycle hooks. In Deku, we only pass you the data model. If you need to access the DOM element this is a side-effect. You should dispatch an action and let another part of your application handle the side-effect. This allows you to keep your component completely DOM-free, which makes it easier to test and allows you to reuse side-effects.

```js
function render ({ path }) {
  return <input id={path} type="text" value="focus me!" />
}

function onCreate ({ dispatch, path }) {
  dispatch({
    type: 'FOCUS',
    selector: `#${path}`
  })
}

export default {
  render,
  onCreate
}
```
