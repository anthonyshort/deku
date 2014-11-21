# Deku

> This project is still a [work-in-progress](https://github.com/segmentio/deku/issues/3)

Create composable, reactive views that use implement a virtual DOM system similar to React. The benefits of using Deku over React:

* Smaller at roughly 5kb
* Readable source
* No globals or global state
* Easily testable components without needing Jest
* Isolated components that don't need a global to be mounted
* It doesn't create virtual events
* It doesn't support old IE
* Easily add plugins
* Events instead of mixins
* Render methods can be imported instead of inline reducing the need for JSX

It has similar capabilities to React:

* Components return a virtual tree using a `render` method
* Batched rendering using `requestAnimationFrame`
* Optimized tree diffs
* Server-side rendering

```js
var component = require('segmentio/deku');

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
      dom(ButtonComponent, { text: props.buttonText })
    ]);
  }
});

// Plugins are super easy to add and don't require
// a separate build to get them.
App.use(styleHelper());

// Returns a scene.
var scene = App.mount(document.body, {
  buttonText: 'Click Me!'
});

// We can set the props which triggers a render next frame.
scene.setProps({
  buttonText: 'Do it...'
});

// And then unmount it when we're done.
scene.remove();
```
