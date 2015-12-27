# Deku [![Circle CI](https://circleci.com/gh/dekujs/deku/tree/2.0.0.svg?style=svg)](https://circleci.com/gh/dekujs/deku/tree/2.0.0)

Deku is a library for rendering interfaces using pure, stateless functions. Instead of using classes and local state, Deku uses plain functions and pushes the responsibility of all state management and side-effects onto tools like Redux.

* There's no local state or access to the DOM within components. All side-effects and state manipulation are expected to be handled by a state container like [Redux](https://github.com/rackt/redux).
* By not supporting legacy browsers the code can be smaller and faster.
* It can be used in place of libraries like React and works well with Redux and other libraries in the React ecosystem.

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![npm downloads](https://img.shields.io/npm/dm/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku)

### Installation

```
npm install --save deku
```

We support the latest two versions of each browser. This means we only support IE10+.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

### Examples

Each example can be run in the browser so you can get an understanding of how Deku works:

```
budo --live index.js -- -t babelify
```

### Motivation

React provides a great developer experience and enables a functional approach to rendering interfaces. However, it's just OOP in disguise. You're still hiding and encapsulating state within components, so you still run into the same problem of tracking down state changes and side-effects.

This is great to help people switch to this new paradigm, but it's possible to remove a lot of complexity by avoiding older browsers and classical style.

Tools like Elm and Redux have show that it's possible to avoid relying on hidden state and escape hatches. By using a central system that manages state and side-effects we can push all the stateful logic into middleware.

I wanted to build a library that was small and relied completely on a state container to manage actions, rather than mixing application logic into interface components.

The API was heavily based on React, and owes a lot of the recent internal changes to [virtex](https://github.com/ashaffer/virtex) and [snabbdom](https://github.com/paldepind/snabbdom).

### Tutorial

To learn Deku we'll build a simple counter application from scratch. We borrowed this example from the [Elm Architecture Tutorialhttps://github.com/evancz/elm-architecture-tutorialm](https://github.com/evancz/elm-architecture-tutorial), but we'll keep it simple for now. In this application we'll have a list of counters, you'll be able to hit `+` or `-` to increase or decrease the number of a counter, and you'll also be able to add or remove counters.

The most basic way to use Deku is to just create a DOM renderer and render some static elements onto the page. We'll assume you're using Babel to enable JSX and ES2015 syntax. Let's render something to the page first.

```js
// app.js
import {dom, element} from 'deku'

// Create a renderer
let render = dom(document.body)

// This renders the content into document.body
render(<div>Hello World!</div>)
```

We've imported the `dom` function to create a DOM renderer. We can give this `render` function some virtual elements and it will turn them into real DOM nodes and add them to `document.body`. Deku also comes with a string renderer for rendering on the server.

Imagine now that we want to render more than just a bit of HTML, maybe we want to render an entire page. It might get a bit messy keeping all of that in here, so let's make a function that will return the elements we want rendered:

```js
// page.js
import {element} from 'deku'

export function render (text) {
  return <div>{text}</div>
}
```

Then we can import and use this function in our app:

```js
// app.js
import {dom, element} from 'deku'
import {page} from './page'

// Create a renderer
let render = dom(document.body)

// This renders the content into document.body
render(page('Hello World!'))
```



You create pure components by exporting modules:

```js
import {element} from 'deku'

function render ({ props, children }) {
  return <button class="my-button">{model.children}</button>
}

export default {
  render
}
```

We're using JSX here because Deku supports JSX through Babel. Just set the JSX pragma to `element`. Otherwise, you can use the `element` function directly:

```js
import {element as h} from 'deku'

function render ({ props, children }) {
  return h('button', { class: "my-button" }, [children])
}

export default {
  render
}
```

Then create a DOM renderer using `dom` that allows you to render it within an element on the page:

```js
import {dom} from 'deku'
import Button from './button'

let render = dom(document.body)

render(
  <div class="App">
    <Button>Hello World!</Button>
  </div>
)
```

### License

The MIT License (MIT) Copyright (c) 2015 Anthony Short
