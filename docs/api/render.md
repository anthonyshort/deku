### `render(el, vnode, [context])`

```js
render(el, <div>Hello World</div>, {
  route: '/login'
})
```

The `render` function is how you'll render virtual elements into the DOM. It takes a DOM element, a virtual element, and an optional context object.

The DOM element should:

* **Not be the document.body**. You'll probably run into problems with other libraries. They'll often add elements to the `document.body` which can confuse the diff algorithm.
* **Be empty**. All elements inside of the container will be removed when a virtual element is rendered into it. The renderer needs to have complete control of all of the elements within the container.

The `context` object will be passed into each component function.
