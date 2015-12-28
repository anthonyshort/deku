# JSX

The `element` function used to create virtual elements is compatible with [JSX](http://jsx.github.io) through [Babel](https://babeljs.io). When using Babel you just need to set the `jsxPragma`. This allows you to automatically transform HTML in your code into `element` calls.

## Setting the pragma

Here's an example `.babelrc` that sets the pragma:

```
{
  "presets": ["es2015"],
  "plugins": [
    ["transform-react-jsx", {"pragma": "element"}]
  ]
}
```

## How does it work?

JSX is just syntax sugar for creating object trees. You can use Deku perfectly fine without JSX, but if you're already using Babel you can use JSX without any extra work.

Instead of writing each `element` call:

```js
function render (model) {
  return (
    element('button', { class: 'Button' }, [
      element('span', { class: 'Button-text' }, ['Click Me!'])
    ])
  )
}
```

You can write HTML:

```js
function render (model) {
  return (
    <button class='Button'>
      <span class='Button-text'>Click Me!</span>
    </button>
  )
}
```
