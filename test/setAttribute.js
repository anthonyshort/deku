import test from 'tape'
import {setAttribute} from '../src/dom/setAttribute'

test('setAttribute (checkboxes)', t => {
  let DOMElement = document.createElement('input')
  DOMElement.setAttribute('type', 'checkbox')
  setAttribute(DOMElement, 'checked', true)
  t.assert(DOMElement.checked, 'element checked')
  setAttribute(DOMElement, 'checked', false)
  t.assert(!DOMElement.checked, 'element unchecked')
  setAttribute(DOMElement, 'disabled', true)
  t.assert(DOMElement.disabled, 'element disabled')
  setAttribute(DOMElement, 'disabled', false)
  t.assert(!DOMElement.disabled, 'element enabled')
  setAttribute(DOMElement, 'selected', true)
  t.assert(DOMElement.selected, 'element selected')
  setAttribute(DOMElement, 'selected', false)
  t.assert(!DOMElement.selected, 'element unselected')
  setAttribute(DOMElement, 'value', 'foo')
  t.equal(DOMElement.value, 'foo', 'value set')
  setAttribute(DOMElement, 'value', 2)
  t.equal(DOMElement.value, '2', 'value updated')
  setAttribute(DOMElement, 'value', null)
  t.equal(DOMElement.value, '', 'value removed')
  t.end()
})

test('setAttribute (textfield)', t => {
  let DOMElement = document.createElement('input')
  DOMElement.setAttribute('type', 'text')
  setAttribute(DOMElement, 'disabled', true)
  t.assert(DOMElement.disabled, 'element disabled')
  setAttribute(DOMElement, 'disabled', false)
  t.assert(!DOMElement.disabled, 'element enabled')
  setAttribute(DOMElement, 'value', 'foo')
  t.equal(DOMElement.value, 'foo', 'value set')
  setAttribute(DOMElement, 'value', 2)
  t.equal(DOMElement.value, '2', 'value updated')
  setAttribute(DOMElement, 'value', 0)
  t.equal(DOMElement.value, '0', 'value updated to zero')
  setAttribute(DOMElement, 'value', null)
  t.equal(DOMElement.value, '', 'value removed')
  t.end()
})

test('setAttribute (innerHTML)', t => {
  let DOMElement = document.createElement('div')
  setAttribute(DOMElement, 'innerHTML', '<span></span>')
  t.equal(DOMElement.innerHTML, '<span></span>', 'innerHTML set')
  setAttribute(DOMElement, 'innerHTML', '')
  t.equal(DOMElement.innerHTML, '', 'innerHTML removed')
  t.end()
})

test('setAttribute (function value)', t => {
  let DOMElement = document.createElement('div')
  setAttribute(DOMElement, 'class', el => 'bar')
  t.equal(DOMElement.className, 'bar', 'function as a value')
  t.end()
})

test('setAttribute (event handler)', t => {
  let DOMElement = document.createElement('div')
  setAttribute(DOMElement, 'onClick', el => 'bar')
  t.equal(DOMElement.outerHTML, '<div></div>', 'event handler')
  t.end()
})

test('setting the same attribute value does not touch the DOM', t => {
  let el = document.createElement('div')
  setAttribute(el, 'name', 'Bob', null)
  el.setAttribute = () => t.fail('DOM was touched')
  setAttribute(el, 'name', 'Bob', 'Bob')
  t.pass()
  t.end()
})

test('setting value should maintain cursor position', t => {
  let input = document.createElement('input')
  input.setAttribute('type', 'text')
  document.body.appendChild(input)

  // Cursor position
  setAttribute(input, 'value', 'Game of Thrones')
  input.focus()
  input.setSelectionRange(5, 7)

  // Position should be the same
  setAttribute(input, 'value', 'Way of Kings')
  t.equal(input.selectionStart, 5, 'selection start')
  t.equal(input.selectionEnd, 7, 'selection end')

  // Remove focus
  if (input.setActive) {
    document.body.setActive()
  } else {
    input.blur()
  }

  // The selection should changed
  setAttribute(input, 'value', 'Hello World!')
  t.notEqual(input.selectionStart, 5, 'selection start')
  t.notEqual(input.selectionEnd, 7, 'selection end')

  // Clean up
  document.body.removeChild(input)
  t.end()
})

// Browser throw an unavoidable error if you try getting the selection from
// email inputs. It's a browser bug.
test('setting value on fields that do not maintain selection', t => {
  let input = document.createElement('input')
  input.setAttribute('type', 'email')
  setAttribute(input, 'value', 'a@b.com')
  t.pass()
  t.end()
})

test('selecting option elements', t => {
  let el = document.createElement('div')
  el.innerHTML = `
    <select>
      <option selected>one</option>
      <option>two</option>
    </select>
    `
  let options = el.querySelectorAll('option')
  setAttribute(options[1], 'selected', true)
  t.equal(options[0].selected, false, 'is not selected')
  t.equal(options[1].selected, true, 'is selected')
  t.end()
})
