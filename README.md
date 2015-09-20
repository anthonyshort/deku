# Deku

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku) [![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/dekujs/deku) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![Slack](https://img.shields.io/badge/Slack-Join%20Chat%20→-blue.svg?style=flat-square)](https://dekujs.herokuapp.com)

Deku is a functional library for rendering user interfaces. It's small (~6kb) and doesn't support legacy browsers.

```js
import h from 'virtual-element'
import {render} from 'deku'

let MyButton = model => {
  <button class="my-button">{model.children}</button>
}

render(
  document.body,
  <div class="App">
    <MyButton>Hello World!</MyButton>
  </div>
)
```

### Install

```
npm install --save deku
```

We've decided not support Bower or downloading the releases individually to keep things simple.

### Documentation


### Running tests

Deku is built with Browserify. You can run the tests in a browser by running `make test`. Learn how to build and work on Deku [in the documentation](https://github.com/dekujs/deku/blob/master/docs/guides/development.md).

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

### Thanks

* React: For initially creating the concept of virtual DOM rendering.
* virtual-dom: For bringing the virtual DOM approach to smaller modules.
* Redux: For making it possible to remove state from the components and simplify life x10. Also, your docs are incredible. Totally borrowed the style of documentation.
* Elm:

### License

The MIT License (MIT) Copyright (c) 2015 Anthony Short
