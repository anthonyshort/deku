# Rendering to document.body

While it is possible to use `document.body` as the target container it can cause some issues if you're using third-party libraries that modify the DOM.

```js
// This is dangerous
var app = tree(<App />)
render(app, document.body)
```

When the renderer diffs and touches the DOM it is expecting nodes to exist in a particular way. Adding or removing DOM nodes without the renderer knowing can break the diffing algorithm.

You should consider all of the DOM nodes within your container untouchable. Any manual modifications can break your app.

## Solution

Create another element inside of the `document.body` that is dedicated to your app:

```js
<body>
  <div id="app"></div>
</body>
```

And use that element instead:

```js
var app = tree(<App />)
render(app, document.getElementById('app'))
```
