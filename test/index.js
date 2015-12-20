/** @jsx h */

require('babel-polyfill')

import test from 'tape'
import isDOM from 'is-dom'
import trigger from 'trigger-event'
import {diffNode, diffAttributes, diffChildren, groupByKey} from '../src/diff'
import {createDOMRenderer, update as patch} from '../src/createDOMRenderer'
import {setAttribute} from '../src/setAttribute'
import createElement from '../src/createElement'
// import renderString from '../src/renderString'
import * as actions from '../src/actions'
import h, {createTextElement} from '../src/element'

import './setAttribute'
import './createElement'
import './diffAttributes'

test('render (elements)', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<span />)
  t.equal(el.innerHTML, '<span></span>', 'no attribute')
  render(<div><span /></div>)
  t.equal(el.innerHTML, '<div><span></span></div>')
  render(<div><div /></div>)
  t.equal(el.innerHTML, '<div><div></div></div>')
  t.end()
})

test('render (attributes)', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<span name='Bob' />)
  t.equal(el.innerHTML, '<span name="Bob"></span>', 'string')
  render(<span name={0} />)
  t.equal(el.innerHTML, '<span name="0"></span>', 'number')
  render(<span name={null} />)
  t.equal(el.innerHTML, '<span></span>', 'null')
  render(<span name={undefined} />)
  t.equal(el.innerHTML, '<span></span>', 'undefined')
  render(<span name={false} />)
  t.equal(el.innerHTML, '<span></span>', 'false')
  render(<span name={true} />)
  t.equal(el.innerHTML, '<span name="true"></span>', 'true')
  render(<span name='' />)
  t.equal(el.innerHTML, '<span name=""></span>', 'empty string')
  render(<input value={0} />)
  t.equal(el.innerHTML, '<input>', 'input with 0 value')
  t.equal(el.firstChild.value, '0', 'input value set')
  t.end()
})

test('render (text)', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<span>Hello World</span>)
  t.equal(el.innerHTML, `<span>Hello World</span>`, 'text rendered')
  render(<span>Hello Pluto</span>)
  t.equal(el.innerHTML, '<span>Hello Pluto</span>', 'text updated')
  render(<span></span>)
  t.equal(el.innerHTML, '<span></span>', 'text removed')
  render(<span>{undefined} World</span>)
  t.equal(el.innerHTML, '<span> World</span>', 'undefined is not rendered')
  render(<span>{null} World</span>)
  t.equal(el.innerHTML, '<span> World</span>', 'null is not rendered')
  render(<span>{true} World</span>)
  t.equal(el.innerHTML, '<span>true World</span>', 'boolean is rendered')
  t.end()
})

// test.skip('moving components with keys', t => {
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//   var one, two, three
//   let ListItem = model => <li>{model.children}</li>
//
//   t.plan(10)
//
//   render(
//     <ul>
//       <ListItem key='foo'>One</ListItem>
//       <ListItem key='bar'>Two</ListItem>
//     </ul>
//   )
//   var [one, two] = el.querySelectorAll('li')
//
//   // Moving
//   render(
//     <ul>
//       <ListItem key='bar'>Two</ListItem>
//       <ListItem key='foo'>One</ListItem>
//     </ul>
//   )
//   var updated = el.querySelectorAll('li')
//   t.ok(updated[1] === one, 'foo moved down')
//   t.ok(updated[0] === two, 'bar moved up')
//
//   // Removing
//   render(
//     <ul>
//       <ListItem key='bar'>Two</ListItem>
//     </ul>
//   )
//   updated = el.querySelectorAll('li')
//   t.ok(updated[0] === two && updated.length === 1, 'foo was removed')
//
//   // Updating
//   render(
//     <ul>
//       <ListItem key='foo'>One</ListItem>
//       <ListItem key='bar'>Two</ListItem>
//       <ListItem key='baz'>Three</ListItem>
//     </ul>
//   )
//   var [one,two,three] = el.querySelectorAll('li')
//   render(
//     <ul>
//       <ListItem key='foo'>One</ListItem>
//       <ListItem key='baz'>Four</ListItem>
//     </ul>
//   )
//   var updated = el.querySelectorAll('li')
//   t.ok(updated[0] === one, 'foo is the same')
//   t.ok(updated[1] === three, 'baz is the same')
//   t.ok(updated[1].innerHTML === 'Four', 'baz was updated')
//   var foo = updated[0]
//   var baz = updated[1]
//
//   // Adding
//   render(
//     <ul>
//       <ListItem key='foo'>One</ListItem>
//       <ListItem key='bar'>Five</ListItem>
//       <ListItem key='baz'>Four</ListItem>
//     </ul>
//   )
//   var updated = el.querySelectorAll('li')
//   t.ok(updated[0] === foo, 'foo is the same')
//   t.ok(updated[2] === baz, 'baz is the same')
//   t.ok(updated[1].innerHTML === 'Five', 'bar was added')
//
//   // Moving event handlers
//   // var clicked = () => pass('event handler moved')
//   // render(
//   //   <ul>
//   //     <ListItem key='foo'>One</ListItem>
//   //     <ListItem key='bar'>
//   //       <span onClick={clicked}>Click Me!</span>
//   //     </ListItem>
//   //   </ul>
//   // )
//   // render(
//   //   <ul>
//   //     <ListItem key='bar'>
//   //       <span onClick={clicked}>Click Me!</span>
//   //     </ListItem>
//   //     <ListItem key='foo'>One</ListItem>
//   //   </ul>
//   // )
//   // trigger(el.querySelector('span'), 'click')
//
//   // Removing handlers. If the handler isn't removed from
//   // the path correctly, it will still fire the handler from
//   // the previous assertion.
//   render(
//     <ul>
//       <ListItem key='foo'>
//         <span>One</span>
//       </ListItem>
//     </ul>
//   )
//   trigger(el.querySelector('span'), 'click')
//
//   t.end()
// })
