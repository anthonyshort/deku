import test from 'tape'
import isDOM from 'is-dom'
import h from '../src/element'
import trigger from 'trigger-event'
import createElement from '../src/createElement'

test('create element', t => {
  let DOMElement = createElement(<div color='red' />)
  t.assert(isDOM(DOMElement), 'is DOM element')
  t.equal(DOMElement.tagName, 'DIV', 'is correct tag')
  t.equal(DOMElement.getAttribute('color'), 'red', 'has attributes')
  t.end()
})

test('create element with text', t => {
  let DOMElement = createElement(<div>Hello World</div>)
  t.equal(DOMElement.firstChild.nodeType, 3, 'is a text element')
  t.equal(DOMElement.firstChild.data, 'Hello World', 'has text content')
  t.end()
})

test('create element with child', t => {
  let DOMElement = createElement(<div><span color='red' /></div>)
  t.equal(DOMElement.children.length, 1, 'has children')
  t.equal(DOMElement.innerHTML, '<span color="red"></span>', 'has correct content')
  t.end()
})

test('create input element', t => {
  let DOMElement = createElement(<input type='text' value='foo' disabled />)
  t.equal(DOMElement.tagName, 'INPUT', 'is correct tag')
  t.equal(DOMElement.type, 'text', 'is a text input')
  t.equal(DOMElement.value, 'foo', 'has a value')
  t.equal(DOMElement.disabled, true, 'is disabled')
  t.end()
})

test('create element with event handlers', t => {
  let count = 0
  let DOMElement = createElement(<span onClick={e => count += 1} />)
  document.body.appendChild(DOMElement)
  trigger(DOMElement, 'click')
  t.equal(count, 1, 'event added')
  document.body.removeChild(DOMElement)
  t.end()
})
