# Deku

![Build Status](https://circleci.com/gh/segmentio/deku.png)

<img  width="200" align="right" src="http://img4.wikia.nocookie.net/__cb20091220220017/zelda/images/e/ee/Deku_Stick.png" />

> This project is still a [work-in-progress](https://github.com/segmentio/deku/issues/3)

Create composable, reactive views that use implement a virtual DOM system similar to React. 

The benefits of using Deku over React:

* Smaller at roughly 5kb
* Readable source
* No globals or global state
* Easily testable components without needing Jest
* Isolated components that don't need a global to be mounted
* It doesn't create virtual events
* It only supports evergreen browsers
* Easily add plugins
* Events instead of mixins
* Render methods can be imported instead of inline reducing the need for JSX

It has similar capabilities to React:

* Components return a virtual tree using a `render` method
* Batched rendering using `requestAnimationFrame`
* Optimized tree diffs
* Server-side rendering

## Install

```
npm install deku
```

## Example 

```js
var component = require('deku');

// Simple button component.
var ButtonComponent = component({
  onClick() {
    this.setState({ clicked: true });
  }
  render(dom, state, props) {
    return dom('button', { onClick: this.onClick }, [props.text]);
  }
});

// Our main app.
var App = component({
  render(dom, state, props) {
    return dom('div', { class: 'App' }, [
      ButtonComponent({ text: props.buttonText })
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
