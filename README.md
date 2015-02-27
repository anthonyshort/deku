# Deku

> A simple library for creating UI components using virtual DOM.

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)
[![Dependency Status](https://david-dm.org/segmentio/deku.svg?style=flat-square)](https://david-dm.org/segmentio/deku)
[![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/segmentio/deku)
[![npm](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()

<img  width="200" align="right" src="https://i.cloudup.com/fDqKHg1ude.png" />

* It's small at roughly 8kb. 
* Supports npm, [duo](https://github.com/duojs/duo), and bower.
* Easily add [plugins](https://github.com/segmentio/deku/wiki/plugins) to any component.
* It only supports IE10+ and better browsers.
* Server-side rendering.
* Easily test components.
* Handles all event delegation for you without virtual events.
* Batched and optimized updates using `requestAnimationFrame`.

## Example

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

var scene = Button.render(document.body, {
  text: 'Click Me!'
});
```

## Getting Started

* [Quick Start](https://github.com/segmentio/deku/wiki/quickstart)
* [Examples](https://github.com/segmentio/deku/wiki/examples)
* [Documentation](https://github.com/segmentio/deku/wiki)
* [Deku vs. React](https://github.com/segmentio/deku/wiki/deku-vs-react)
* [How it works](https://github.com/segmentio/deku/wiki/how-it-works)
* [Plugins](https://github.com/segmentio/deku/wiki/plugins)

## Download

Browserify/Node:

```
npm install deku
```

Duo: 

```
var deku = require('segmentio/deku');
```

Bower:

```
bower install deku
```

Or download and use them manually:

* [dist/deku.js](https://raw.githubusercontent.com/segmentio/deku/master/index.js)

## Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

## JSX Support

There are a number of libraries around now that can transpile JSX into JS that aren't tied to React. The easiest way to use JSX with Deku is to use [Babel](https://github.com/babel/babel) (formerly known as 6to5). 

Babel comes with a JSX transformer that can be used by adding a comment to the top of your file:

```js
/** @jsx dom */
var {component,dom} = require('deku');

var Button = component({
  render(props, state) {
    return <a class="button" onClick={this.onClick}>{props.text}</a>;
  }
});
```

You can also use [jsx-transform](https://github.com/alexmingoia/jsx-transform) if you're looking for something simple.

## Developing

Deku is built using [Browserify](https://github.com/substack/node-browserify) and Make. You can build the project by running `make` in the directory.

To run the tests you can call `make test` to run tests in Phantom or `make test-browser` to run the tests in a browser. See the Makefile for the rest of the tasks.

## Authors

* Anthony Short — anthony@segment.com
* Lance Pollard — lance@segment.com

