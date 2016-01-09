# `diff`

The `diff` object provides functions for comparing two virtual nodes. Mostly useful if you're creating your own renderer.

```js
import {diff} from 'deku'
```

### Properties

* [`diffNode`](#diffNode)
* [`Actions`](#Actions)

## `diffNode(prevNode, nextNode)`

Returns the difference between two virtual nodes as an array of actions that can be used by a renderer to patch a view.

### Arguments

1. `prevNode` _(VirtualElement)_: The current renderer vnode
2. `nextNode` _(VirtualElement)_: The updated vnode

### Returns

`actions` _(Array)_: An array of `Action` objects that describe the change that needs to be made to update the view.

### Example

```js
import {diff, element} from 'deku'

const {diffNode, Actions} = diff

let left = element('div', { class: 'foo' })
let right = element('div', { class: 'bar' })

let changes = diff(left, right)

changes.forEach(action => {
  Actions.case({
    setAttribute: (name, value, previousValue) => {
      // update the attribute
    }
  }, action)
})
```

## `Actions`

An object containing union types for actions produced during the diff. You can create new actions using this object, but this is usually handled by `diffNode`.

### Example

```js
import {diff, element} from 'deku'

const {Actions} = diff

// Create a new action.
let action = Actions.setAttribute('class', 'foo', 'bar')

// Switch between the different action types
Actions.case({
  setAttribute: (name, value, previousValue) => {
    // Use the action
  }
}, action)
```
