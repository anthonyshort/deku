/** @jsx element */

import {element,render,tree} from 'deku'

// Create a component
var HelloWorld = {
  render(component) {
    let {props,state} = component
    return (
      <div>
        {props.text}
      </div>
    )
  }
}

// Create a tree
var app = tree(<HelloWorld text="Hello World!" />)

// Render the tree to the DOM
render(app, document.body)
