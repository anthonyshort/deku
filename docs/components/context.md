# Context

Context is an object you can set when you call render. It will be accessible from every component in the tree.

```js
let context = {
  theme: 'red'
}

function App (model, context) {
  return <div style="background-color:${context.theme}">Hi</div>
}

render(document.body, <App />, context)
```

Every component in the tree is passed in the context object. This is ideal for theming, storing actions, storing global data, or storing routers.  

Unlike React you can't change the context in components. This is ok because components have no state, so we have a much simpler implementation. This means we don't need to check if the context has changed to know if a component should re-render.
