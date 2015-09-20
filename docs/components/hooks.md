# Lifecycle hooks

These are functions you can add to your component to hook into different parts of the rendering process. You can use these to manipulate the DOM in some way or trigger an action to change state.

```js
export default function MyComponent (model) {
  return <div>{model.text}</div>
}

export function onCreate () {
  console.log('A MyComponent entity was created!')
}
```

| Name      | Triggered                                                                | Arguments                   |
|-----------|--------------------------------------------------------------------------|-----------------------------|
| onCreate  | When the component is initially created                                  | `model`, `context`          |
| onInsert  | After the DOM element has been created and inserted into the DOM         | `model`, `context`, `el`    |
| onUpdate  | After the component is re-rendered and the DOM is patched                | `model`, `context`, `el`    |
| onRemove  | When the DOM element has been removed from the DOM                       | `model`, `context`, `el`    |
| onDestroy | When the component is removed completed                                  | `model`, `context`          |
| validate  | Called before each render to validate the model                          | `attributes`, `context`     |
