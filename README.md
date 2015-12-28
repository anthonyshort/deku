# Deku [![Circle CI](https://circleci.com/gh/dekujs/deku/tree/2.0.0.svg?style=svg)](https://circleci.com/gh/dekujs/deku/tree/2.0.0)

Deku is a library for rendering interfaces using pure functions.

Instead of using classes and local state, Deku just uses functions and pushes the responsibility of all state management and side-effects onto tools like [Redux](http://redux.js.org/).

* There's no local state or access to the DOM within components. All side-effects and state manipulation are expected to be handled by a state container like [Redux](https://github.com/rackt/redux).
* By not supporting legacy browsers the code can be smaller and faster.
* It can be used in place of libraries like React and works well with Redux and other libraries in the React ecosystem.

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![npm downloads](https://img.shields.io/npm/dm/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)

### Installation

```
npm install --save deku
```

We support the latest two versions of each browser. This means we only support IE10+.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

### Examples

Each example can be run in the browser so you can get an understanding of how Deku works:

```
budo --live index.js -- -t babelify
```

### License

The MIT License (MIT) Copyright (c) 2015 Anthony Short
