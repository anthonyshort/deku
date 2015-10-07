/** @jsx element */

import App from './app'
import element from 'dekujs/virtual-element'
import { render, tree } from 'dekujs/deku'

// Initial todos
var todos = [
  { text: 'Hello!' },
  { text: 'Buy milk' }
]

// Create the app
var app = tree(<App items={todos} />)

// Set values on the tree that can be accessed by
// any component by using propTypes and setting the 'source'
// option to be 'removeTodo'
app.set('removeTodo', function(todo){
  var newTodos = todos.filter(function(target){
    return target !== todo
  })
  app.mount(
    <App items={newTodos} />
  )
})

// Render into the DOM
render(app, document.body)
