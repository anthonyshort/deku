# Deku

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku) [![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/dekujs/deku) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![Slack](https://img.shields.io/badge/Slack-Join%20Chat%20→-blue.svg?style=flat-square)](https://dekujs.herokuapp.com)

A library for creating UI components using virtual DOM as an alternative to [React](https://github.com/facebook/react). Deku has a smaller footprint (~6kb), a functional API, and doesn't support legacy browsers.

```
npm install deku virtual-element
```

You can also use Duo, Bower or [download the files manually](https://github.com/dekujs/deku/releases).

## Example

```js
import element from 'virtual-element'
import {render,tree} from 'deku'
import MyButton from './button'

var app = tree(
  <div class="MyApp">
    <MyButton>Hello World!</MyButton>
  </div>
)

render(app, document.body)
```

## Introduction

Deku is a DOM renderer for virtual elements that also allows us to define custom element types. It runs diffing algorithm on these virtual elements to update the real DOM in a performant way.

**Heads up:** These examples are written using ES2015 syntax. You'll want to make sure you're familiar with modules and destructuring to follow along.

Virtual elements are plain objects that represent real DOM elements:

```js
{
  type: 'button',
  attributes: { class: 'Button' },
  children: props.children
}
```

Which can then be rendered by Deku to the DOM. This example will render a button to the `document.body` with a class of `Button`:

```js
import {render,tree} from 'deku'

var button = {
  type: 'button',
  attributes: { class: 'Button' }
}

// Create an app
var app = tree(button)

// Automatically re-renders the app when state changes
render(app, document.body)
```

You can define your own custom elements that can contain their own state. These are called **components**. Components are objects that (at the very least) have a render function. This render function is passed in a component object with these properties:

* `props`: This is any external data
* `state`: This is any internal data that is hidden from the world
* `id`: The instance id of the component

Here's an example `App` component that renders a paragraph:

```js
import {render,app} from 'deku'

// Define our custom element. The render method should
// return a new virtual element.
var App = {
  render: function ({ props, state }) {
    return {
      type: 'p',
      attributes: { color: props.color }
    }
  }
}

// Then create a virtual element with our custom type
var app = tree({
  type: App, // <- custom type instead of a string
  attributes: { color: 'red' } // <- these become 'props'
})

// And render it to the DOM
render(app, document.body)
```

## Virtual Elements

But these virtual elements aren't very easy to read. The good news is that you can use other libraries to add a DSL for creating these objects:

* [virtual-element](https://github.com/dekujs/virtual-element)
* [magic-virtual-element](https://github.com/dekujs/magic-virtual-element)

So you can use the `virtual-element` module to easily create these objects instead:

```js
element('div', { class: "App" }, [
  element('button', { class: "Button" }, 'Click Me!')
])
```

And if you're using `virtual-element` [you can also use JSX](https://github.com/dekujs/deku/blob/master/docs/guides/jsx.md) to make rendering nodes more developer friendly. This is equivalant to the previous example:

```jsx
<div class="App">
  <button class="Button">Click Me!</button>
</div>
```

JSX might seem offensive at first, but if you're already using Babel you get JSX for free. Think of it as a more familiar way to define tree structures. **The rest of the examples will assume we're using JSX.** You can go ahead and imagine the same syntax using the `virtual-element` DSL or the raw object format.

So the previous app example would look like this using JSX (notice that we're importing the `virtual-element` module this time):

```js
import element from 'virtual-element'
import {render,tree} from 'deku'

// Define our custom element
var App = {
  render: function ({ props }) {
    return <p color={props.color}>Hello World</p>
  }
}

var app = tree(<App color="red" />)

// And render it to the DOM
render(app, document.body)
```

## Custom Elements

So now we can start defining components in their own module and export them. Let's create a custom button element:

```js
// button.js
import element from 'virtual-element'

let MyButton = {
  render ({props}) {
    return <button class="Button">{props.children}</button>
  }  
}

export {MyButton}
```

Then we can import it and render it in the same way:

```js
// app.js
import element from 'virtual-element'
import {MyButton} from './button'
import {render,tree} from 'deku'

// We're using our custom MyButton element
var app = tree(
  <div class="MyApp">
    <MyButton>Hello World!</MyButton>
  </div>
)

render(app, document.body)
```

You can also render these same elements and custom elements on the server using `renderString` instead of `render`:

```js
// server.js
import element from 'virtual-element'
import {MyButton} from './button'
import {renderString,tree} from 'deku'

let html = renderString(tree(
  <div class="MyApp">
    <MyButton>Hello World!</MyButton>
  </div>
))
```

That's all there is to it. Components can also have [hook functions](https://github.com/dekujs/deku/blob/master/docs/guides/components.md) so you can do some work when they are created, removed or updated, and you can [add state](https://github.com/dekujs/deku/blob/master/docs/guides/components.md) to your components.

## Next steps

* [Installing](https://github.com/dekujs/deku/blob/master/docs/guides/install.md)
* [Component API](https://github.com/dekujs/deku/blob/master/docs/guides/components.md)
* [Using JSX](https://github.com/dekujs/deku/blob/master/docs/guides/jsx.md)
* [Client + Server Rendering Example](https://github.com/dekujs/todomvc)
* [Community resources](https://github.com/stevenmiller888/awesome-deku)
* [Contributing to Deku](https://github.com/dekujs/deku/blob/master/docs/guides/development.md)

## Tests

Deku is built with Browserify. You can run the tests in a browser by running `make test`. Learn how to build and work on Deku [in the documentation](https://github.com/dekujs/deku/blob/master/docs/guides/development.md).

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

## License

The MIT License (MIT) Copyright (c) 2015 Anthony Short
