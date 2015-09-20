### `renderString(vnode, [context])`

```js
renderString(<div>Hello World</div>, {
  route: '/login'
})
```

This function renders a virtual element to a string. It will render components and call all hooks as normal. This can be used on the server to pre-render an app as HTML, and then replaced on the client.

The `context` object will be passed into each component function.
