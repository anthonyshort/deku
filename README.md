# Deku

[![npm version](https://badge.fury.io/js/deku.svg)](http://badge.fury.io/js/deku)

<img  width="200" align="right" src="https://i.cloudup.com/fDqKHg1ude.png" />

A library for creating UI components using a [virtual DOM](https://github.com/segmentio/deku/blob/master/docs/virtual-dom.md).

* It's small and modular. Roughly **8kb minified**. 
* Supports **npm, duo, and bower**.
* It has a beautiful, **simple API** for defining components.
* Uses a **virtual DOM** and diffing to run updates.
* It only supports **evergreen browsers**.
* Components can be used **without the library**.
* Components can be rendered to a string for **server-side rendering**.
* Easily **testable components**.
* Handles all **event delegation** for you without virtual events.
* **Batched and optimized updates** using `requestAnimationFrame`.

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
* [What is components?](https://github.com/segmentio/deku/blob/master/docs/components.md)
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

Or [download the latest release](https://github.com/segmentio/deku/tree/master/dist) manually.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)
