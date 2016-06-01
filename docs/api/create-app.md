# `createApp`

Returns a `render` function that you can use to render elements within `DOMElement`.

### Arguments

1. `el` _(HTMLElement)_: A container element that will have virtual elements rendered inside of it. The element will never be touched.
2. `dispatch` _(Function)_: A function that can receive actions from the interface. This function will be passed into every component. It usually takes an [action](http://redux.js.org/docs/basics/Actions.html) that can be handled by a [store](http://redux.js.org/docs/basics/Store.html)

### Returns

`render` _(Function)_: A function that will update the current virtual element. It accepts a new `vnode` and a `context` object that will be passed to every component. You can use the context object to send shared state to every component. The `context` object should be immutable if possible as internally the renderer can provide extra optimizations.

### Example

```js
import {createApp, element} from 'deku'
import {createStore} from 'redux'
import reducer from './reducer'
import App from './app'

// Create a redux store to handle actions
let store = createStore(reducer)

// Create a renderer
let render = createApp(document.body, store.dispatch)

// This renders the content into document.body
render(<App size="small" />)

// Update the UI
render(<App size="large" />)
```

### Notes


* You should **avoid using document.body as the container element**. You'll probably run into problems with other libraries. They'll often add elements to the `document.body` which can confuse the diff algorithm.

* When the container element is not empty, **deku would assume that the HTML elements inside the container are the pre-rendered elements**. Read [this page](/deku/docs/tips/pre-rendered.md) to learn more about working with pre-rendered elements.


. All elements inside of the container will be removed when a virtual element is rendered into it. The renderer needs to have complete control of all of the elements within the container.
