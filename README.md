# Deku

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku) [![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/dekujs/deku) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![Slack](https://img.shields.io/badge/Slack-Join%20Chat%20→-blue.svg?style=flat-square)](https://dekujs.herokuapp.com)

Deku is a functional library for rendering user interfaces. It's small (~6kb) and doesn't support legacy browsers.

```js
import h from 'virtual-element'
import {render} from 'deku'

let MyButton = model => {
  <button class="my-button">{model.children}</button>
}

render(
  document.body,
  <div class="App">
    <MyButton>Hello World!</MyButton>
  </div>
)
```

## Table of contents

* [Download](#Download)
* [Why?](#Why)
* [Basics](#basics)
  * [Overview](#overview)
  * [Virtual elements](#virtual-elements)
    * [Event handlers](#event-handlers)
    * [Attribute hooks](#attribute-hooks)
    * [Keys](#keys)
  * [Components](#components)
    * [Model](#model)
    * [Context](#context)
    * [Hooks](#hooks)
    * [Validation](#validation)
    * [State](#state)
      * [Accessing previous model](#previous-state)
    * [Performance](#performance)
* [Advanced](#advanced)
  * [Elm architecture](#elm-architecture)
  * [Server rendering](#server-rendering)
  * [Animation](#animation)
  * [Styling](#styling)
  * [Custom renderers](#custom-renderers)
  * [Magic attributes](#magic-attributes)
  * [Routing](#routing)
* [API Reference](#api-reference)
  * [render](#render)
  * [renderString](#renderstring)
* [FAQ](#faq)
* [Thanks](#thanks)
* [How to contribute](#how-to-contribute)
* [Community resources](#community-resources)

## Download

```
npm install deku
```

You can also use Duo, Bower or [download the files manually](https://github.com/dekujs/deku/releases).

## Why?

#### Functional components
Many of the virtual DOM libraries that exist either don't have the concept of components or they focus on hiding state by favouring OOP APIs like classes. Components are a natural way of thinking about pieces of your interface, they're our lego blocks, and they're a first-class feature in Deku. Components allow us to add extra optimizations to the render and add lifecycle hooks to allow the creation of higher-order components.

#### No stateful components
React has components but they are stateful which just brings back the same problems we have with the DOM hiding state, except we're putting it in another place. Removing state from the components makes things easier to reason about.

Deku has no opinion about how you store or manage your state unlike React. When something happens within the interface (e.g. a button is clicked) you handle the event and let some other part of your application change the state. This is a similar approach to Elm and makes Deku a natural fit for state management containers like Redux.

#### No peer dependency problems
Many of the pieces of React are coupled so components usually need to deal with peer dependencies. This is code smell and it's difficult to deal with in large projects. In Deku, components have no knowledge of the renderer itself, they are just plain objects and functions and the virtual element feature is separate.

#### Easy to learn
The API and concepts will be really easy to learn if you've used React. We have many of the same features, like lifecycle hooks, but we've apporached it in a functional way.

## Basics

### Overview

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

### Virtual elements

Before we get into anything too complex we'll need to understand what virtual elements are and how they work. It will make everything else easier to understand as components are just functions that return virtual elements.

Virtual elements are objects that represent nodes in a tree, like the DOM. We call these 'virtual elements' because they create a virtual DOM tree, a tree that looks like the real DOM but doesn't come with all the baggage of rendering real nodes. But what we're really deal with are just nodes in tree.

Nodes can be represented as a simple object:

```js
{
  type: 'button',
  attributes: { class: 'Button' },
  children: []
}
```

They have:

* a `type` that can be any primitive value (e.g. string, object, or function);
* `attributes` that describe it's features;
* and `children`, which is just an array of more nodes.

Notice how we haven't even mentioned Deku yet. These elements can describe nodes in any tree structure. But for our sake we're going to use them to describe the DOM:

```js
var button = {
  type: 'button',
  attributes: { class: 'Button' },
  children: ['Click me!']
}
```

That's the same as writing this in HTML:

```html
<button class="Button">Click me!</button>
```

So you can probable see where we're going with this. We can describe the HTML we want rendered with a bunch of these nodes.

But these virtual elements aren't very easy to read or write so we can use a library to make this a little nicer. The simplest library to use is [virtual-element](https://www.npmjs.com/package/virtual-element). All this library does is provide a nice little API for creating these nodes:

```js
h('button', { class: "Button" }, ['Click Me!'])
```

It takes a type, optional attributes and an optional array of children. It's pretty close to writing real HTML. However this function signature is the same that is expected by [JSX](https://github.com/dekujs/deku/blob/master/docs/guides/jsx.md), so if you're using Babel you can write this instead:

```jsx
<button class="Button">Click Me!</button>
```

Woah, HTML in our JS! Don't worry, this will just compile back down to our simple `h` function above and end up becoming a plain object, just like what we started with:

```js
{
  type: 'button',
  attributes: { class: 'Button' },
  children: ['Click me!']
}
```

You don't nned to use JSX, but it will make life just that little bit nicer for you during development, but for you purists out there feel free to just use the other syntax and you'll be just fine.

Deku just requires objects that look like that, which means you can use any library you want to create those nodes. Say you wanted to allow the `class` attribute to [accept an object or array in addition to a string](https://www.npmjs.com/package/classnames), you could just create your own `virtual-element` module that does that and none of the other components will need to know about it. Neat, huh? This is one great feature that React doesn't have, custom virtual elements!

#### Adding event handlers

You can add event handlers using attributes. There are a number of attributes that Deku will recognize for you. Here are the built-in events:

```js
export let events = {
  onBlur: 'blur',
  onChange: 'change',
  onClick: 'click',
  onContextMenu: 'contextmenu',
  onCopy: 'copy',
  onCut: 'cut',
  onDoubleClick: 'dblclick',
  onDrag: 'drag',
  onDragEnd: 'dragend',
  onDragEnter: 'dragenter',
  onDragExit: 'dragexit',
  onDragLeave: 'dragleave',
  onDragOver: 'dragover',
  onDragStart: 'dragstart',
  onDrop: 'drop',
  onError: 'error',
  onFocus: 'focus',
  onInput: 'input',
  onInvalid: 'invalid',
  onKeyDown: 'keydown',
  onKeyPress: 'keypress',
  onKeyUp: 'keyup',
  onMouseDown: 'mousedown',
  onMouseEnter: 'mouseenter',
  onMouseLeave: 'mouseleave',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
  onPaste: 'paste',
  onReset: 'reset',
  onScroll: 'scroll',
  onSubmit: 'submit',
  onTouchCancel: 'touchcancel',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchStart: 'touchstart',
  onWheel: 'wheel'
}
```

These are treated as special attributes:

```js
function App (model) {
  return <button onClick={clicked}>Hello World</button>
}

function clicked (e) {
  console.log(e)
}
```

These handlers will be added and removed for you. With each render, if the handler doesn't match the new handler, they are swapped.

##### Does Deku delegate events?

Deku doesn't automatically delegate events to keep things simple but it is a good way to avoid adding hundreds of listeners. To delegate events you can just bind at the parent element.

```js
function List (model) {
  return (
    <ul onClick={onClick}>
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  )
}

function onClick (e) {
  if (e.target.tagName === 'LI') {
    console.log('clicked')
  }
}
```

##### How do I access my the model in an event handler?

If you want to send extra information to the handler you can curry or partially apply the handler function. We don't provide any special parameters to the event handlers, so it's as if you called `el.addEventListener` directly.

```js
function App (model) {
  return <div onClick={onClick(model)}>Hello World</div>
}

function onClick (model) {
  return function (e) {
    console.log(model, e)
  }
}
```

Because the handler is changing the function on every render, it will add the new event listener each time like you'd expect.

##### How do I listen to custom events?

Using [attribute hooks](#custom-attribute-hooks) you could also apply the binding yourself:

```js
function App (model) {
  return <input doSomething={el => el.addEventListener('input', fn)} />
}
```

This is useful if you want to support any events that aren't built into the DOM renderer, like custom events.

#### Attribute hooks

Attribute hooks allow you to hook into the rendered DOM element. Whatever value is return is set on the element. So if you return a string, that will be the rendered value in the DOM. However, if you return nothing, no attribute will be rendered.

```js
function App (model) {
  return <div doSomething={someHook} />
}

function someHook (el, name, previousValue) {
  el.style.color = 'red'
}
```

Hooks can be used for a number of things:

* Adding custom event listeners
* Calling a function when an element is created or updated
* Animations
* Setting or getting a special property of the element

When rendering, Deku will only call the function if it is different from the last value. The same way it only updates the attribute value if it's actually changed. This means you can use it to call a function when an element is created.


```js
function App (model) {
  return <div onCreate={onCreate} />
}

function onCreate (el) {
  el.style.color = 'red'
}
```

Each render, that attribute value will point to the same function, so it will only ever be called once. You can do the same with element updates, but by making it a new function each time.

```js
function App (model) {
  function onUpdate (el) {
    el.style.color = 'red'
  }
  return <div onUpdate={onUpdate} />
}
```

These attribute hooks work for any attribute, even regular HTML attributes:

```js
function App (model) {
  return <div style={getStyles} />
}

function getStyles (el) {
  return 'color: red'
}
```

#### Maintaining state using keys

Virtual elements can have a special attribute called `key` that is used to optimize the rendering. It lets Deku know if an element has just been moved around. For example, imagine these virtual elements are returned as children:

```html
<MyComponent />
<div>Hello</div>
```

Then on the next render it looks like this:

```html
<div>Hello</div>
<MyComponent />
```

Deku will compare the two first elements, see they're different and destroy `<MyComponent />` and replace it with a div. The div will also be destroyed and replaced with a new `<MyComponent />`. Most of the time this won't affect you, most components don't store state in any way, and most HTML elements don't have hidden state (except inputs and friends). If for some reason these elements have state that needs to hang around, we can add a key:

```html
<MyComponent key="one" />
<div key="two">Hello</div>
```

Deku will then know on the second pass that they've just moved around, so it won't destroy the elements.

### Components

You can define your own custom elements called **components**. Components are pure functions that are given a `model` and return virtual elements. Unlike React, components in Deku are completely stateless, there's no `setState` function or `this` used. They are useful when you want to be able to hook into the lifecycle of a UI component to perform some action when it is added or removed. They are also used to improve rendering performance because we can skip

Here's an example `App` component that renders a paragraph:

```js
import h from 'virtual-element'
import {render} from 'deku'

function App (model, context) {
  return <p color={model.attributes.color}>Hello World</p>
}

render(document.body, <App color="red" />)
```

#### Model

The model is passed into the Component function and is essentially the state that you can use to create virtual nodes. The model is immutable so to make any changes to values you need modify the state somewhere else and call `render` again from the top level.

The model has these properties:

* `attributes` - The values passed into your component as virtual element attributes.
* `path` - The path to the component within the entire tree.
* `id` - A UID for the component.

#### Context

Context is an object you can set when you call render. It will be accessible from every component in the tree.

```js
let context = {
  theme: 'red'
}

function App (model, context) {
  return <div style="background-color:${context.theme}">Hi</div>
}

render(document.body, <App />, context)
```

Every component in the tree is passed in the context object. This is ideal for theming, storing actions, storing global data, or storing routers.  

Unlike React you can't change the context in components. This is ok because components have no state, so we have a much simpler implementation. This means we don't need to check if the context has changed to know if a component should re-render.

### Component path

The path argument that is passed to the component is it's unique path in the tree. Paths in a tree are strings, like '0.1.5.2'. These are are just indexes. The root node is always `0`, then it's child at index `1`, then it's child at `5`, and so forth. You can use to determine a unique ID for the component in the tree that is deterministic. If a node within that path has a `key` attribute, we use that instead so that the path is stable even if any elements move around. For example, '0.1.foo.2'.

#### Storing state using the path

Deku makes components completely stateless by default. But if for some reason you wanted to store some component state you could do by storing it outside of the component using the path as a key. This gives you the flexibility to still store state temporary state, like hovers or dropdown state. The path is deterministic which means you can re-create the exact tree using server rendering as the path will always reference this component.

Storing component state is still discouraged but this makes it possible.

### Lifecycle hooks

These are functions you can add to your component to hook into different parts of the rendering process. You can use these to manipulate the DOM in some way or trigger an action to change state.

```js
export default function MyComponent (model) {
  return <div>{model.text}</div>
}

export function onCreate () {
  console.log('A MyComponent entity was created!')
}
```

| Name      | Triggered                                                                | Arguments                   |
|-----------|--------------------------------------------------------------------------|-----------------------------|
| onCreate  | When the component is initially created                                  | `model`, `context`          |
| onInsert  | After the DOM element has been created and inserted into the DOM         | `model`, `context`, `el`    |
| onUpdate  | After the component is re-rendered and the DOM is patched                | `model`, `context`, `el`    |
| onRemove  | When the DOM element has been removed from the DOM                       | `model`, `context`, `el`    |
| onDestroy | When the component is removed completed                                  | `model`, `context`          |
| validate  | Called before each render to validate the model                          | `attributes`, `context`     |

## FAQ

### Why would I use Deku over React?

### Why would I use Deku instead of virtual-dom?



## Tests

Deku is built with Browserify. You can run the tests in a browser by running `make test`. Learn how to build and work on Deku [in the documentation](https://github.com/dekujs/deku/blob/master/docs/guides/development.md).

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

## License

The MIT License (MIT) Copyright (c) 2015 Anthony Short
