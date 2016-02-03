/** @jsx h */
import test from 'tape'
import {updateElement} from '../../src/dom'
import trigger from 'trigger-event'
import {Actions} from '../../src/diff'
import {create as h, createTextElement} from '../../src/element'

// Create a patch function with a dummy dispatcher.
let patch = updateElement(action => console.log(action))

test('patching elements', t => {
  let {setAttribute, removeAttribute} = Actions
  let DOMElement = document.createElement('div')

  patch(DOMElement, setAttribute('color', 'red', undefined))
  t.equal(DOMElement.getAttribute('color'), 'red', 'add attribute')

  patch(DOMElement, setAttribute('color', 'blue', 'red'))
  t.equal(DOMElement.getAttribute('color'), 'blue', 'update attribute')

  patch(DOMElement, setAttribute('color', false, 'blue'))
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with false')

  patch(DOMElement, setAttribute('color', 'red', false))
  patch(DOMElement, setAttribute('color', null, 'red'))
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with null')

  patch(DOMElement, setAttribute('color', 'red', null))
  patch(DOMElement, setAttribute('color', undefined, 'red'))
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with undefined')

  patch(DOMElement, removeAttribute('color', undefined))
  t.equal(DOMElement.getAttribute('color'), null, 'remove attribute')

  t.end()
})

test('patching children', t => {
  let {insertChild, updateChild, removeChild, insertBefore, setAttribute, updateChildren} = Actions
  let DOMElement = document.createElement('div')

  patch(
    DOMElement,
    updateChildren([
      insertChild(createTextElement('Hello'), 0, '0')
    ])
  )
  t.equal(DOMElement.innerHTML, 'Hello', 'text child inserted')

  patch(
    DOMElement,
    updateChildren([
      updateChild(0, [
        setAttribute('nodeValue', 'Goodbye', undefined)
      ])
    ])
  )
  t.equal(DOMElement.innerHTML, 'Goodbye', 'text child updated')

  patch(
    DOMElement,
    updateChildren([
      removeChild(0)
    ])
  )
  t.equal(DOMElement.innerHTML, '', 'text child removed')

  patch(
    DOMElement,
    updateChildren([
      insertChild(<span>Hello</span>, 0, '0')
    ])
  )
  t.equal(DOMElement.innerHTML, '<span>Hello</span>', 'element child inserted')

  patch(
    DOMElement,
    updateChildren([
      updateChild(0, [
        setAttribute('color', 'blue', undefined)
      ])
    ])
  )
  t.equal(DOMElement.innerHTML, '<span color="blue">Hello</span>', 'element child updated')

  patch(
    DOMElement,
    updateChildren([
      removeChild(0)
    ])
  )
  t.equal(DOMElement.innerHTML, '', 'element child removed')

  patch(
    DOMElement,
    updateChildren([
      insertChild(<span>0</span>, 0, '0'),
      insertChild(<span>1</span>, 1, '1'),
      insertChild(<span>2</span>, 2, '2')
    ])
  )
  t.equal(DOMElement.childNodes.length, 3, 'multiple children added')

  patch(DOMElement.children[0], insertBefore(2))
  t.equal(DOMElement.innerHTML, '<span>1</span><span>0</span><span>2</span>', 'element moved')

  t.end()
})

test('patching event handlers', t => {
  let {setAttribute, removeAttribute} = Actions
  let count = 0
  let handler = e => count++
  let DOMElement = document.createElement('div')
  document.body.appendChild(DOMElement)

  patch(DOMElement, setAttribute('onClick', handler, undefined))
  trigger(DOMElement, 'click')
  t.equal(count, 1, 'event added')

  patch(DOMElement, removeAttribute('onClick', handler))
  trigger(DOMElement, 'click')
  t.equal(count, 1, 'event removed')

  document.body.removeChild(DOMElement)
  t.end()
})

test('patching inputs', t => {
  let {setAttribute, removeAttribute} = Actions
  let input = document.createElement('input')

  patch(input, setAttribute('value', 'Bob', undefined))
  t.equal(input.value, 'Bob', 'value property set')

  patch(input, setAttribute('value', 'Tom', 'Bob'))
  t.equal(input.value, 'Tom', 'value property updated')

  patch(input, setAttribute('value', 0, 'Tom'))
  t.equal(input.value, '0', 'value property updated to zero')

  patch(input, removeAttribute('value', 'Tom'))
  t.equal(input.value, '', 'value property removed')

  t.end()
})
