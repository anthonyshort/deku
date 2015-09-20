# The container element is not empty

This warning is shown when you try to render into an element that already has children inside of it.

You might be rendering like this:

```js
var app = tree(<App />)
render(app, document.getElementById('app'))
```

And your HTML looks like this:

```html
<body>
  <div id="app">
    <h1>App goes here</h1>
  </div>
</body>
```

When calling `render` and using the `#app` as the container, it will remove the content of that container and replace it with the app. 

## Server-rendering 

You'll get this warning if you're rendering your app first on the server. The HTML that is rendered by the server will be replaced with the new elements when you call `render`.

## Solution

You can ignore this warning if you're just replacing content rendered on the server.

Otherwise you should use an empty element that's only used to render your app into:

```html
<body>
  <div id="app"></div>
</body>
```
