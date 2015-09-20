# Virtual children as an array

You're rendering virtual nodes with an array as a child node. Something like this:

```js
element('div', null, [
  [element('div', null, 'Hello World')] // This can't be an array!
])
```

This often happens if you're using `props.children` directly in the virtual node, because it is an array:


```js
element('div', null, [
  element('div'),
  props.children // This will throw!
])
```

## Solution

Flatten the array of children. There are a few ways to do this. One is using  ES6 spread:

```js
element('div', null, [
  element('div'),
  ...props.children
])
```

Another is to build up the arrays and join them together using an array method like `splice` or `concat`:

```js
var children = [element('div')]
element('div', null, children.concat(props.children))
```
