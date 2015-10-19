# Deku

Deku is a library for rendering user interfaces in a pure, functional way. It's tiny at around ~500LOC and doesn't support legacy browsers. It can be used in place of libraries like React and works well with Redux and other libraries in the React ecosystem.

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![npm downloads](https://img.shields.io/npm/dm/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)
[![Slack](https://img.shields.io/badge/Slack-Join%20Chat%20→-blue.svg?style=flat-square)](https://dekujs.herokuapp.com)

### Example

```js
import h from 'virtual-element'
import {createRenderer} from 'deku'

let MyButton = (model) => {
  return h('button', { class: "my-button" }, [model.children])
}

let render = createRenderer(document.body)

render(
  <div class="App">
    <MyButton>Hello World!</MyButton>
  </div>
)
```

### Install

```
npm install --save deku
```

You'll also want to install a module for creating virtual elements:

```
npm install --save virtual-element
```

### Documentation

You can find all the documentation at https://dekujs.github.io/deku.

### Browser support

We try to support the latest two versions of a browser. This allows us to push the boundaries and keep moving the library forward. Usage on older browsers isn't guaranteed, but let's face it, you'll probably be fine on anything other than < IE 10.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

### Thanks

These projects were all an inspiration for Deku.

* **React**: For initially creating the concept of virtual DOM rendering.
* **virtual-dom**: For bringing the virtual DOM approach to smaller modules.
* **snabbdom**: An extremely simple vdom implementation.
* **Redux**: Totally borrowed the ideas for the documentation.
* **Elm**: Understanding how actions can flow through a system without state.

### License

The MIT License (MIT) Copyright (c) 2015 Anthony Short
