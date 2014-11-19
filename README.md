# Deku

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

var App = component({
  onClick(e) {
    e.preventDefault();
    console.log('clicked!');
  }
  render(dom, state, props) {
    return dom('a', { onClick: this.onClick }, [props.text]);
  }
});

// Plugins are super easy to add. 
App.use(styleHelper);

// Returns a MountedComponent 
var mounted = App.mount(document.body, {
  text: 'Click Me!'
});

// We can set the props which triggers a render next frame
mounted.setProps({
  text: 'Do it...'
})

// Emits events we can hook into which makes it 
// easy to add plugins to components 
mounted.on('afterUpdate', function(){
  console.log('updated!');
}) 

// And then unmount it when we're done
mounted.unmount();
```
