/** @jsx h */
import test from 'tape'
import {createDOMRenderer} from '../src/createDOMRenderer'
import h from '../src/element'

test.skip('changing the root element type', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<div/>)
  let rootEl = el.firstChild
  render(<div>Hello Pluto</div>)
  t.equal(el.firstChild, rootEl, 'not replaced')
  render(<span>Foo!</span>)
  t.notEqual(el.firstChild, rootEl, 'replaced')
  t.end()
})

test.skip('rendering elements', t => {
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
