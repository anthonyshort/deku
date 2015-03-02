# Deku

> A simple library for creating UI components using virtual DOM.

```
npm install deku
```

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku) [![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/segmentio/deku)

## Features

<img  width="200" align="right" src="https://i.cloudup.com/fDqKHg1ude.png" />

* It's small at roughly 8kb. 
* Supports npm, [duo](https://github.com/duojs/duo), and bower.
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

## Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

## Learn More

* [Documentation](https://github.com/segmentio/deku/wiki)
* [[Installing]]
* [[Quick Start]]
* [[Using JSX]]
* [[Deku vs React]]