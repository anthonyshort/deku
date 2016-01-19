# `dom`

The `dom` object provides functions for rendering elements to the DOM. These are lower-level functions that you generally won't need to access unless you're building your own version of `createApp`.

```js
import {dom} from 'deku'
```

### Properties

* `create`
* `update`

## `create`
`(vnode, path, dispatch, context) -> DOMElement`

Create a DOM element from a virtual element.

## `update`
`(dispatch, context) -> (DOMElement, action) -> DOMElement`

Create a function to patch a DOM element using an action.
