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

## Table of contents

* [Download](#Download)
* [Why?](#Why)
* [Basics](#basics)
  * [Overview](#overview)
  * [Virtual elements](#virtual-elements)
    * [Event handlers](#event-handlers)
    * [Attribute hooks](#attribute-hooks)
    * [Keys](#keys)
  * [Components](#components)
    * [Model](#model)
    * [Context](#context)
    * [Hooks](#hooks)
    * [Validation](#validation)
    * [State](#state)
      * [Accessing previous model](#previous-state)
    * [Performance](#performance)
* [Advanced](#advanced)
  * [Elm architecture](#elm-architecture)
  * [Server rendering](#server-rendering)
  * [Animation](#animation)
  * [Styling](#styling)
  * [Custom renderers](#custom-renderers)
  * [Magic attributes](#magic-attributes)
  * [Routing](#routing)
* [API Reference](#api-reference)
  * [render](#render)
  * [renderString](#renderstring)
* [FAQ](#faq)
* [Thanks](#thanks)
* [How to contribute](#how-to-contribute)
* [Community resources](#community-resources)

## Download

```
npm install deku
```

You can also use Duo, Bower or [download the files manually](https://github.com/dekujs/deku/releases).

## Tests

Deku is built with Browserify. You can run the tests in a browser by running `make test`. Learn how to build and work on Deku [in the documentation](https://github.com/dekujs/deku/blob/master/docs/guides/development.md).

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

## License

The MIT License (MIT) Copyright (c) 2015 Anthony Short
