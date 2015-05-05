# deku

[![version](https://img.shields.io/npm/v/deku.svg?style=flat-square)](https://www.npmjs.com/package/deku) [![Circle CI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?style=flat-square)](https://circleci.com/gh/segmentio/deku) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A library for creating UI components using virtual DOM as an alternative to [React](https://github.com/facebook/react). Deku has a smaller footprint (~10kb), a functional API, and doesn't support legacy browsers.

To install:

```
npm install deku
``` 

>  You can also use Duo, Bower or [download the files manually](https://github.com/segmentio/deku/releases).

[Components](https://github.com/segmentio/deku/blob/master/docs/guides/components.md) are just plain objects that have a render function instead of using classes or constructors:

```js
import {dom,tree,render} from 'segmentio/deku'
import * as Todos from './todos'

let app = tree(<Todos/>)
let todos = []
let id = 0
app.set('todos', todos)
app.set('createTodo', function(todo){
  todo.id = id++
  todos.push(todo)
  app.set('todos', todos)
})
app.set('updateTodo', function(todo){
  // ... do the update
  app.set('todos', todos)
})

render(app, document.body)
```

```js
// todos.js
import {dom} from 'segmentio/deku'
import * as Todo from './todo'

export let propTypes = {
  todos: { type: 'array', source: 'todos' },
  createTodo: { type: 'function', source: 'createTodo' }
}

export function render (component, setState) {
  let {props, state} = component
  let {createTodo} = state
  let {todos} = props

  let todoNodes = todos.map(function(todo){
    return <Todo todo={todo}/>
  })

  return (
    <div class="Todos">
      <input type="text" placeholder="Add todo" onEnter={onEnter}/>
      {todoNodes}
    </div>
  )

  function onEnter(event) {
    createTodo({ title: event.target.value })
  }
}
```

```js
// todo.js
import {dom} from 'segmentio/deku'

export let propTypes = {
  todo: { type: 'object' },
  updateTodo: { type: 'function', source: 'updateTodo' }
}

export function render (component) {
  let {props, state} = component
  let {updateTodo, todo} = props
  
  return (
    <div class="Todo">
      <span class="Todo-title">{todo.title}</span>
      <input type="checkbox" value={todo.completed} onChange={onChange}/>
    </div>
  )

  function onChange(event) {
    todo.completed = !!event.target.value;
    updateTodo(todo);
  }
}
```

Trees can be rendered on the server too:

```js
let str = renderString(app)
```

## Docs

* [Installing](https://github.com/segmentio/deku/blob/master/docs/guides/install.md)
* [What are components?](https://github.com/segmentio/deku/blob/master/docs/guides/components.md)
* [Using JSX](https://github.com/segmentio/deku/blob/master/docs/guides/jsx.md)

## Tests

[![Sauce Test Status](https://saucelabs.com/browser-matrix/deku.svg)](https://saucelabs.com/u/deku)

## License

MIT. See [LICENSE.md](http://github.com/segmentio/deku/blob/master/LICENSE.md)
