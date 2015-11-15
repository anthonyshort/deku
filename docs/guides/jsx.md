# Using JSX

Without JSX, you'll use the `element` function to build up virtual elements that represent components and DOM elements:

```js
export function render (component) {
  let {props, state, id} = component;
  return element('a', { class: "button", onClick: onClick }, [props.text])
}
```

JSX just makes this easier to write and read by making it read like HTML:

```js
export function render (component) {
  let {props, state, id} = component;
  return <a class="button" onClick={onClick}>{props.text}</a>;
}
```

There are a number of libraries around now that can transpile JSX into JS that aren't tied to React. The easiest way to use JSX with Deku is to use [Babel](https://github.com/babel/babel).

## .babelrc

The easiest way is to install Babel's [React JSX Transform plugin](http://babeljs.io/docs/plugins/transform-react-jsx/):

`npm install babel-plugin-transform-react-jsx`

and then, include it via your `.babelrc` file:

```
{
  "plugins": [
    ["transform-react-jsx", { "pragma": "element" }]
  ]
}
```

See [here](https://github.com/dekujs/deku/blob/b4ebc98eb8eb295c59f0aa07bea2a8c3257ad827/docs/guides/jsx.md#babelrc) for Babel 5 instructions.

Then make sure you import the `element` function:

```js
import element from 'virtual-element'

export function render (component) {
  let {props, state, id} = component;
  return <a class="button" onClick={onClick}>{props.text}</a>
}
```

## Comment

You can also add a comment to the top of your files that tells babel which function to use when replacing JSX:

```js
/** @jsx element */
import element from 'virtual-element'

export function render (component) {
  let {props, state, id} = component;
  return <a class="button" onClick={onClick}>{props.text}</a>;
}
```

## Other transforms

You can also use [jsx-transform](https://github.com/alexmingoia/jsx-transform) if you're looking for something simple.
