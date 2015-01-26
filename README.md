# Deku

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)
[![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/segmentio/deku)
[![npm](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()

<img  width="200" align="right" src="https://i.cloudup.com/fDqKHg1ude.png" />

A library for creating UI components using a [virtual DOM](https://github.com/segmentio/deku/blob/master/docs/virtual-dom.md).

* It's small and modular. Roughly 8kb minified. 
* Built using Browserify.
* Supports npm, duo, and bower.
* It has a simple, familiar for defining components.
* Uses a virtual DOM to render templates.
* It only supports IE10+ and better browsers.
* Components can be used without the library.
* Server-side rendering on components.
* Easily testable components.
* Handles all event delegation for you.
* No virtual events.
* Batched and optimized updates using `requestAnimationFrame`.
* ES6-ready

```js
var {component,dom} = require('deku');

var Button = component({
  onClick() {
    this.setState({ clicked: true });
  },
  render(props, state) {
    return dom('button', { onClick: this.onClick }, [props.text]);
  }
});

Button.render(document.body, {
  text: 'Click Me!'
});
```

## Getting Started

* [Quick Start](https://github.com/segmentio/deku/tree/master/docs/quick-start.md)
* [Documentation](https://github.com/segmentio/deku/tree/master/docs)
* [What are components?](https://github.com/segmentio/deku/blob/master/docs/components.md)
* [What is virtual DOM?](https://github.com/segmentio/deku/blob/master/docs/virtual-dom.md)
* [How it works](https://github.com/segmentio/deku/blob/master/docs/how-it-works.md)
* [Deku vs. React](https://github.com/segmentio/deku/blob/master/docs/react.md)
* [Developing](https://github.com/segmentio/deku/tree/master/docs/dev.md)
* [Examples](https://github.com/segmentio/deku/tree/master/examples)

## Download

```
npm install deku
```
```
bower install deku
```

Using [Duo](https://github.com/duojs/duo): 

```
var deku = require('segmentio/deku');
```

Or download and use them manually:

* [dist/deku.js](https://raw.githubusercontent.com/segmentio/deku/master/dist/deku.js)
* [dist/deku.min.js](https://raw.githubusercontent.com/segmentio/deku/master/dist/deku.min.js)

## Build Status

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)