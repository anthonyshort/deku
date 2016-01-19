# `vnode`

Contains helper functions for working with virtual nodes. Mostly useful if you're creating your own renderer.

```js
import {vnode} from 'deku'
```

### Properties

* create
* createTextElement
* createThunkElement
* createEmptyElement
* isThunk
* isText
* isEmpty
* isSameThunk
* isValidAttribute
* createPath

## `create(type, attributes, children)`

An alias for `element`.

## `createTextElement(text)`

Create a virtual text element.

## `createThunkElement(component, key, props, children)`

Create a virtual thunk element. These are lazily-rendered virtual elements.

## `createEmptyElement()`

Create a virtual element that represents an empty space.

## `isThunk(vnode)`

Check if a vnode is a thunk type.

## `isText(vnode)`

Check if a vnode is a text type.

## `isEmpty(vnode)`

Check if a vnode is an empty type.

## `isSameThunk(prevNode, nextNode)`

Check to see if two virtual elements are both the same type of thunk.

## `isValidAttribute(value)`

Check to see if an attribute is valid and should be rendered.

## `createPath(...paths)`

Takes arguments and joins them with a `.` to produce a path.
