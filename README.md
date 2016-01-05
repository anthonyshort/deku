# Deku

[![version](https://img.shields.io/travis/dekujs/deku.svg?style=flat-square)](https://travis-ci.org/dekujs/deku)
[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![npm downloads](https://img.shields.io/npm/dm/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)
[![discord](https://img.shields.io/badge/Discord-Join%20Chat%20→-738BD7.svg?style=flat-square)](https://discord.gg/0gNkyCAVkDYsBaFe)

Deku is a library for rendering interfaces using pure functions and virtual DOM.

Instead of using classes and local state, Deku just uses functions and pushes the responsibility of all state management and side-effects onto tools like [Redux](http://redux.js.org/). It also aims to support only modern browsers to keep things simple.

It can be used in place of libraries like React and works well with Redux and other libraries in the React ecosystem.

Deku consists of 4 modules packaged together for convenience:

* `element`: Creating virtual elements
* `diff`: Computing the difference between two virtual elements
* `dom`: DOM renderer
* `string`: HTML string renderer

### Installation

```
npm install --save deku
```

We support the latest two versions of each browser. This means we only support IE10+.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

### Example

```js
import {dom, element} from 'deku'
import {createStore} from 'redux'
import reducer from './reducer'
let {createRenderer} = dom

// Dispatch an action when the button is clicked
let log = dispatch => event => {
  dispatch({
    type: 'CLICKED'
  })
}

// Define a state-less component
let MyButton = {
  render: ({ props, children, dispatch }) => {
    return <button onClick={log(dispatch)}>{children}</button>
  }
}

// Create a Redux store to handle all UI actions and side-effects
let store = createStore(reducer)

// Create a renderer that can turn vnodes into real DOM elements
let render = createRenderer(document.body, store.dispatch)

// Update the page and add redux state to the context
render(
  <MyButton>Hello World!</MyButton>,
  store.getState()
)
```

### Documentation

You can [read the documentation online](https://dekujs.github.io/deku).

### Bundling

If you require another format than commonjs, you can bundle deku to AMD, UMD or globals formats. The following commands will create `dist/deku.js`:

```
npm run standalone -- -f iife [--uglify]
npm run standalone -- -f amd  [--uglify]
npm run standalone -- -f umd  [--uglify]
```

### License

The MIT License (MIT) Copyright (c) 2015 Anthony Short
