# Deku

Deku is a library for rendering user interfaces in a pure, functional way. It's tiny at around ~500LOC and doesn't support legacy browsers. It can be used in place of libraries like React and works well with Redux and other libraries in the React ecosystem.

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![npm downloads](https://img.shields.io/npm/dm/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)

### Installation

```
npm install --save deku
```

You'll probably also want to install a module for creating virtual elements:

```
npm install --save virtual-element
```

### Features

* State-less components with lifecycle hooks
* Render to a string instead of the DOM for server-side rendering
* Fixes cross-browser quirks
* SVG support

### Usage

```js
import h from 'virtual-element'
import { createDOMRenderer } from 'deku'

let MyButton = (model) => {
  return h('button', { class: "my-button" }, [model.children])
}

let render = createDOMRenderer(document.body)

render(
  <div class="App">
    <MyButton>Hello World!</MyButton>
  </div>
)
```

### Examples

You can view examples in the [examples branch](https://github.com/dekujs/deku/tree/examples).

### Documentation

The full documentation can be viewed here: https://dekujs.github.io/deku.

### Browser support

We support the latest two versions of each browser. This means we only support IE10+.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

### License

The MIT License (MIT) Copyright (c) 2015 Anthony Short
