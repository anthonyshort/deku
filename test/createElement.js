/** @jsx h */
import test from 'tape'
import isDOM from 'is-dom'
import {create as h} from '../src/element'
import trigger from 'trigger-event'
import createElement from '../src/dom/createElement'

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

test('create element with null child', t => {
  let DOMElement = createElement(<div>{null}</div>)
  t.equal(DOMElement.children.length, 1, 'has one child')
  t.equal(DOMElement.innerHTML, '<noscript></noscript>', 'has correct content')
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

test('create range input', t => {
  let DOMElement = createElement(<input type='range' min={0} max={10} value={5} step={1}/>)
  t.equal(DOMElement.value, '5', 'has a value')
  t.end()
})

test('create input element with zero value', t => {
  let DOMElement = createElement(<input type='text' value={0} disabled />)
  t.equal(DOMElement.value, '0', 'has a value')
  t.end()
})

test('create element with event handlers', t => {
  let count = 0
  let DOMElement = createElement(<span onClick={e => count += 1} />)
  document.body.appendChild(DOMElement)
  trigger(DOMElement, 'click')
  t.equal(count, 1, 'event added')
  t.equal(DOMElement.outerHTML, '<span></span>')
  document.body.removeChild(DOMElement)
  t.end()
})

test('create element with thunk', t => {
  let Component = {
    render: () => <div />
  }
  let DOMElement = createElement(<Component />)
  t.assert(isDOM(DOMElement), 'is DOM element')
  t.equal(DOMElement.tagName, 'DIV', 'is correct tag')
  t.end()
})

test('crate element with plain function thunk', t => {
  let Component = () => <div />
  let DOMElement = createElement(<Component />)
  t.assert(isDOM(DOMElement), 'is DOM element')
  t.equal(DOMElement.tagName, 'DIV', 'is correct tag')
  t.end()
})

test('create select element', t => {
  let DOMElement = createElement(
    <select>
      <option>Hello</option>
      <option selected>World</option>
    </select>
  )
  t.equal(DOMElement.tagName, 'SELECT', 'is correct tag')
  t.equal(DOMElement.selectedIndex, 1, 'correct option is selected')
  t.equal(DOMElement.options[1].selected, true, 'correct option is selected')
  t.end()
})
