# JSX

The `element` function used to create virtual elements is compatible with [JSX] through [Babel]. When using Babel you just need to set the `jsxPragma`. This allows you to automatically transform HTML in your code into `element` calls.

[JSX]: https://facebook.github.io/jsx/
[Babel]: https://babeljs.io

## Setting up Babel

Be sure to install [babel-preset-es2015](http://babeljs.io/docs/plugins/preset-es2015/) and [babel-plugin-transform-react-jsx](https://babeljs.io/docs/plugins/transform-react-jsx/).

```
npm install babel-preset-es2015
npm install babel-plugin-transform-react-jsx
```

You will need to set the `pragma`. Here's an example `.babelrc` that sets the pragma:

```json
{
  "presets": ["es2015"],
  "plugins": [
    ["transform-react-jsx", {"pragma": "element"}]
  ]
}
```

Alternatively, you can specify it in each of your files with a `@jsx` pragma comment:

```js
/** @jsx element */

import { element } from 'deku'
```

From here, you can use [browserify] with [babelify] to build your final .js package.

```sh
npm install --save browserify
npm install --save babelify

# compile the entry point `index.js` to `dist/application.js`
browserify -t babelify index.js -o dist/application.js
```

Alternatively, you can also use [babel-cli] to compile your JS files.

[browserify]: https://www.npmjs.com/package/browserify
[babelify]: https://www.npmjs.com/package/babelify
[babel-cli]: https://www.npmjs.com/package/babel-cli

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
