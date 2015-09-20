# Overview

Deku is a library that allows you to create and compose components that render virtual elements. Here's a basic example that we'll step through:

```js
import h from 'virtual-element'
import {render} from 'deku'

function MyButton (model, context) {
  return <button class="my-button">{model.children}</button>
}

render(
  document.body,
  <div class="App">
    <MyButton>Hello World!</MyButton>
  </div>
)
```

First, we're importing a library to create virtual elements.

```js
import h from 'virtual-element'
```

Unlike React and other libraries, the virtual elements used in Deku are plain objects with no knowledge of what's rendering them. We'll cover this in more detail in the next section.

```js
import {render} from 'deku'
```

Then we're importing the renderer.

Deku exports two functions: `render` and `renderString`. These are essentially two included renderers for virtual elements for rendering to the DOM.

The render function takes a DOM element to use as a container, a virtual element, and an optional context argument:

```js
render(DOMElement el, VirtualElement vnode, Object context)
```

This function is curried, allowing you to set the paramters and create new functions:

```js
let renderToContainer = render(containerEl)
renderToContainer(<div>Hello!</div>)
```

In the example we also created a component. Components in Deku are functions:

```js
function MyButton (model, context) {
  return <button class="my-button">{model.children}</button>
}
```

They can also have other functions added to them called [lifecycle hooks](#lifecycle-hooks):

```js
MyButton.onCreate = function () {
  console.log('created a new MyButton somewhere')
}
```

If you're using ES6 modules, we can also just directly export functions:

```js
export default function MyButton (model) {
  return <button class="my-button">{model.children}</button>
}

export function onCreate () {
  console.log('created a new MyButton somewhere')
}
```
