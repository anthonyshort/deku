# deku

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku) [![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/segmentio/deku) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A library for creating UI components using virtual DOM as an alternative to [React](https://github.com/facebook/react). Deku has a smaller footprint (~10kb), a functional API, and doesn't support legacy browsers.

To install:

```
npm install deku
``` 

>  You can also use Duo, Bower or [download the files manually](https://github.com/segmentio/deku/releases).

[Components](https://github.com/segmentio/deku/blob/master/docs/guides/components.md) are just plain objects that have a render function instead of using classes or constructors:

```js
// button.js
export let propTypes = {
  kind: {
    type: 'string',
    expects: ['submit', 'button']
  }
}

export function render (component) {
  let {props, state} = component
  return <button class="Button" type={props.kind}>{props.children}</button>
}

export function afterUpdate (component, prevProps, prevState, setState) {
  let {props, state} = component
  if (!state.clicked) {
    setState({ clicked: true })
  }
}
```

Components are then rendered by mounting it in a tree:

```js
import * as Button from './button'
import {tree,render,renderString} from 'deku'

let app = tree(
  <Button kind="submit">Hello World!</Button>
)

render(app, document.body)
```

Trees can be rendered on the server too:

```js
let str = renderString(app)
```

## Docs

* [Installing](https://github.com/segmentio/deku/blob/master/docs/guides/install.md)
* [What are components?](https://github.com/segmentio/deku/blob/master/docs/guides/components.md)
* [Using JSX](https://github.com/segmentio/deku/blob/master/docs/guides/jsx.md)

## Tests

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

## License

MIT. See [LICENSE.md](http://github.com/segmentio/deku/blob/master/LICENSE.md)