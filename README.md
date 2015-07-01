# Deku

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku) [![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/dekujs/deku) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![Slack](https://img.shields.io/badge/Slack-Join%20Chat%20→-blue.svg?style=flat-square)](https://dekujs.herokuapp.com)

A library for creating UI components using virtual DOM as an alternative to [React](https://github.com/facebook/react). Deku has a smaller footprint (~8kb), a functional API, and doesn't support legacy browsers.

To install:

```
npm install deku
```

>  You can also use Duo, Bower or [download the files manually](https://github.com/dekujs/deku/releases).

[Components](https://github.com/dekujs/deku/blob/master/docs/guides/components.md) are just plain objects that have a render function instead of using classes or constructors:

```js
// button.js

let Button = {
  render (component) {
    let {props, state} = component
    return <button class="Button" type={props.kind}>{props.children}</button>
  },
  afterUpdate (component, prevProps, prevState, updateState) {
    let {props, state} = component
    if (!state.clicked) {
      updateState({ clicked: true })
    }
  }
}

export {Button}
```

Components are then rendered by mounting it in a tree:

```js
import {Button} from './button'
import {tree,render,renderString} from 'deku'

let app = tree(
  <Button kind="submit">Hello World!</Button>
)

render(app, document.body)
```

Trees can be rendered on the server too:

```js
let str = renderString(app)
```

## Docs

* [Installing](https://github.com/dekujs/deku/blob/master/docs/guides/install.md)
* [Component Spec](https://github.com/dekujs/deku/blob/master/docs/guides/components.md)
* [Using JSX](https://github.com/dekujs/deku/blob/master/docs/guides/jsx.md)
* [Client + Server Rendering Example](https://github.com/dekujs/todomvc)
* [Community resources](https://github.com/stevenmiller888/awesome-deku)

## Components

Each element of your UI can be broken into encapsulated components. These components manage the state for the UI element and tell it how to render. In Deku components are just plain objects:

```js
function render (component) {
  let {props, state} = component
  return <button class="Button">{props.children}</button>
}

export default {render}
```

There is no concept of classes or use of `this`. We can import this component using the standard module syntax:

```js
import Button from './button'
```

[Read more about components](https://github.com/dekujs/deku/blob/master/docs/guides/components.md)

## Rendering Components

To render this to the DOM we need to create a `tree`. This is one of the other main differences between React and Deku. The `tree` will manage loading data, communicating between components and allows us to use plugins on the entire application.

```js
import {element,tree} from 'deku'
var app = tree(<Button>Hello World</Button>)
```

The `app` object has only a couple of methods:

* `.set(name, value)` to set environment data
* `.option(name, value)` to set rendering options
* `.mount(vnode)` to change the virtual element currently mounted
* `.use(fn)` to use a plugin. The function is called with the `app` object.

You can render this tree anyway you like, you just need a renderer for it. Let's use the DOM renderer for the client:

```js
import Button from './button'
import {element,tree,render} from 'deku'

var app = tree(<Button>Hello World</Button>)
render(app, document.body)
```

And render the same thing to a string on the server:

```js
import koa from 'koa'
import {element,tree,renderString} from 'deku'

let app = koa()

app.use(function *() {
  this.body = renderString(tree(<Button>Hello World</Button>))
})
```

And you can isolate functionality by using plugins. These plugins can call `set` to add data to the tree that your components can then access through their props:

```js
app.use(analytics)
app.use(router)
app.use(api(writeKey))
```

## Composition

You can compose components easily by just requiring them and using them in the render function:

```js
import Button from './button'
import Sheet from './sheet'

function render (component) {
  return (
    <div class="MyCoolApp">
      <Sheet>
        <Button style="danger">One</Button>
        <Button style="happy">Two</Button>
      </Sheet>
    </div>
  )
}
```

## Event handlers

Deku doesn't use any form of synthetic events because we can just capture every event in newer browsers. There are special attributes you can add to virtual elements that act as hooks to add event listeners:

```js
function render (component) {
  let {props, state} = component
  return <button onClick={clicked}>{props.children}</button>
}

function clicked (event, component, updateState) {
  alert('You clicked it')
}
```

You can [view all event handlers](https://github.com/dekujs/deku/blob/master/lib/events.js) in code.

You can access the event, the component and update the state in event handlers:

```js
function clicked (event, component, updateState) {
  let {props,state} = component
}
```

To access the element you'll usually want to `event.target`. This is the element the event was triggered on. We also set `event.delegateTarget` that will always be set to the element that owns the handler if it was a deeper element that triggered the event. 

## Lifecycle hooks

Just like the `render` function, component lifecycle hooks are just plain functions:

```js
function afterUpdate (component, prevProps, prevState, updateState) {
  let {props, state} = component
  if (!state.clicked) {
    updateState({ clicked: true })
  }
}
```

We have hooks for `beforeMount`, `afterMount`, `beforeUpdate`, `afterUpdate`, `beforeUnmount` and two new hooks - `beforeRender` and `afterRender` that are called on every pass, unlike the update hooks. We've found that these extra hooks have allowed us to write cleaner code and worry less about the state of the component.

[Learn more about the lifecycle hooks](https://github.com/dekujs/deku/blob/master/docs/guides/components.md)

## Prop Validation

Prop validation isn't handle by Deku, but because we're dealing with pure functions it's easy enough to just compose it yourself using [some other validation library](https://www.npmjs.com/package/validate):

```js
import schema from 'validate'

let {assert} = schema({
  name: {
    type: 'string',
    required: true,
    message: 'name is required'
  }
})

let render = function({ props, state }) {
  assert(props)
  return <div></div>
}
```

## External data and communication

It's often useful for components to have access to data from the outside world without needing to pass it down through components. You can set data on your `tree` and components can ask for it using `propTypes`.

First we set some data on the app:

```js
app.set('currentUser', {
  id: 12435,
  username: 'anthonyshort',
  name: 'Anthony Short'
})
```

Then in our components we define the prop using the `source` option:

```js
let propTypes = {
  user: {
    source: 'currentUser'
  }
}
```

Whenever we change that value in our app all components that depend on it will be re-rendered with the latest value. We use this pattern to pass functions down to interact with the API:

```js
app.set('updateProject', function (project, updates) {
  api.projects.update(project, updates)
})
```

Which the component can access using `props.updateProject`. Although it may not be as complex or optimized as Relay and GraphQL it's extremely simple and covers most use cases we've run into so far. We even use this pattern to treat the router as a data source:

```js
router.on('/projects/:id', function (params) {
  let project = api.projects.get(params.id)
  app.set('currentRoute', {
    name: 'view project',
    project: project
  })
})
```

This means we don't need to use some complex routing library. We just treat it like all other types of external data and components will render as needed.

## Keys

Sometimes when you're rendering a list of items you want them to be moved instead of trashed during the diff. Deku supports this using the `key` attribute on components:

```js
function render (component) {
  let {items} = component.props
  let projects = items.map(function (project) {
    return <ProjectItem key={project.id} project={project} />
  })
  return <div class="ProjectsList">{projects}</div>
}
```

At the moment we only support the `key` attribute on components for simplicity. Things become slightly more hairy when moving elements around within components. So far we haven't ran into a case where this has been a major problem.

## Experimental: ES7 async functions

The purpose of most lifecycle hooks is usually to update the state, either by inspecting the DOM or fetching some external resources. We can simplify the concept of the lifecycle hooks by making the pure using ES7 async functions.

```js
async function afterMount ({ props }, el) {
  var items = await request(props.url)
  var projects = await Projects.getAll()

  // Return an object to update state
  return { 
    items: items,
    projects: projects,
    loaded: true
  }
}
```

Instead of using the `updateState` function we can just return an object that will be merged in with the current state. We can do this because the lifecycle hooks are able to return a promise that resolves into a state change. All you need to do is return a promise and resolve it with an object. 

We could do this with standard promises too:

```js
function afterMount ({ props }, el) {
  return request(props.url)
    .then(Projects.getAll)
    .then(function(items, projects){
      return {
        items: items,
        projects: projects,
        loaded: true
      }
    })
}
```

## innerHTML

You can set a string of html to be set as `innerHTML` using the `innerHTML` attribute on your virtual elements:

```
<div innerHTML="<span>hi</span>" />
```

**Deku doesn't do any sanitizing of the HTML string so you'll want to do that yourself to prevent XSS attacks.**

## Tests

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

## Developing

Deku is built with Browserify. You can run the tests in a browser by running `make test`.

## License

MIT. See [LICENSE.md](http://github.com/dekujs/deku/blob/master/LICENSE.md)
