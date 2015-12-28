# `string`

The `string` object provides functions for rendering virtual elements to a string.

```js
import {string} from 'deku'
```

### Properties

* [`render`](#-render-vnode-context)

## `render(vnode, [context])`

This function renders a virtual element to a string. It will render components and call all hooks as normal. This can be used on the server to pre-render an app as HTML, and then replaced on the client.

The `context` object will be passed into each component function.

### Arguments

1. `vnode` _(VirtualElement)_: A virtual element to render as a string.
2. `context` _(Object)_: You can use the context object to send shared state to every component. The `context` object should be immutable if possible as internally the renderer can provide extra optimizations.

### Returns

`html` _(String)_: A string of HTML that can be rendered on the server.

### Example

```js
import {string, element} from 'deku'
import Sidebar from './sidebar'
import Header from './header'
import App from './app'

let html = string.render(
  <div>
    <Header />
    <Sidebar />
    <App />
  </div>
)
```
