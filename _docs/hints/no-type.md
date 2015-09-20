# Element doesn't have a type

This error can occur when a component object is `null` or `undefined`. 

When using JSX, you might write something like this:

```js
function render (component) {
  return <div>Hello</div>
}
```

This is transformed into a function that creates virtual elements:

```js
function render (component) {
  return element('div', {}, ['Hello'])
}
```

When using components, the first attribute will be your component object:

```js
function render (component) {
  return element(MyButton, {}, ['Hello'])
}
```

## Solution

### Make sure your `import`s are correct

```js
// The file doesn't exist
import Foo from './foo'

// The file does not export 'Bar'
import Bar from './bar'
```

When using ES6 modules with Babel if a module can't be found it will be `undefined` instead of throwing an error. When you try to render virtual elements, the first parameter will be null. Make sure you a importing the correct values from the module.
