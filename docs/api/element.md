# `element(type, attributes, children)`

Returns a `render` function that you can use to render elements within `DOMElement`. The function signature is compatible with JSX.

### Arguments

1. `type` _(String|Object)_: Each node in a tree has a type. This is only used when rendering the tree.
2. `attributes` _(Object)_ (Optional): The attributes of this node, similar to HTML attributes.
3. `children` _(Array)_ (Optional): An array of children. Each child should also be an `element`. Strings are also accepted for text nodes.

### Returns

`vnode` _(Object)_: An object representing a node within a tree.

### Example

```js
import {element} from 'deku'

// Native elements
element('div', { class: "greeting" }, [
  element('span', {}, ['Hello'])
])

// Components
let App = {
  render: ({ props }) => <div>Hello {props.name}!</div>
}

element(App, { name: "Tom" })
```
