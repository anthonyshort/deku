# Deku

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

<img  width="200" align="right" src="http://img4.wikia.nocookie.net/__cb20091220220017/zelda/images/e/ee/Deku_Stick.png" />

> This project is still a [work-in-progress](https://github.com/segmentio/deku/issues/3)

Create composable, reactive views that use implement a virtual DOM system similar to React. You create components and use lifecycle hooks to change the state of the component.

It has similar capabilities to React:

* Components return a virtual tree using a `render` method
* Lifecycle hooks (beforeMount, afterMount etc.)
* Optimized tree diffing algorithm
* Components can be rendered to a string for server-side rendering

But why use Deku instead of React?

* It's smaller. Roughly 8kb. And built from
* Readable source
* No globals or global state
* Easily testable components without needing Jest
* It doesn't create virtual events
* It only supports evergreen browsers
* Easily add plugins
* Batched updates using `requestAnimationFrame`

## Install

```
npm install deku
```

## Example

This example uses ES6 syntax:

```js
var {component, dom} = require('deku');

// Simple button component.
var ButtonComponent = component({
  onClick() {
    this.setState({ clicked: true });
  }
  render(props, state) {
    return dom('button', { onClick: this.onClick }, [props.text]);
  }
});

// Our main app.
var App = component({
  render(props, state) {
    return dom('div', { class: 'App' }, [
      dom(ButtonComponent, { text: props.buttonText })
    ]);
  }
});

// Returns a scene.
var scene = App.mount(document.body, {
  buttonText: 'Click Me!'
});

// We set the props from the top and render the scene top-down
scene.setProps({
  buttonText: 'Do it...'
});
```

## Todo

- [] Tests for propsChanged
- [] Emit events on Component events
- [] Return a promise from setState
- [] Add test for invalidate
- [] key property diffing
- [] entity.setProps should merge instead of replacing