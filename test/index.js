/** @jsx h */

require('babel-polyfill')

import test from 'tape'
import isDOM from 'is-dom'
import trigger from 'trigger-event'
import {diffNode, groupByKey} from '../src/diff'
import createRenderer from '../src/createDOMRenderer'
import {setAttribute, removeAttribute} from '../src/updateAttribute'
import createElement from '../src/createElement'
// import renderString from '../src/renderString'
import * as actions from '../src/actions'
import patch from '../src/updateElement'
import h from '../src/element'

test('grouping virtual nodes', t => {
  let one = <div/>
  let two = <div key='foo'/>
  let three = <div/>
  let result = groupByKey([one, two, three, null, 'foo'])
  t.deepEqual(result, [
    { key: '0', item: one, index: 0 },
    { key: 'foo', item: two, index: 1 },
    { key: '2', item: three, index: 2 },
    { key: '4', item: 'foo', index: 4 }
  ])
  t.end()
})

test('updating attributes', t => {
  let DOMElement
  DOMElement = document.createElement('input')
  DOMElement.setAttribute('type', 'checkbox')
  setAttribute(DOMElement, 'checked', true)
  t.assert(DOMElement.checked, 'element checked')
  setAttribute(DOMElement, 'checked', false)
  t.assert(!DOMElement.checked, 'element unchecked')
  setAttribute(DOMElement, 'disabled', true)
  t.assert(DOMElement.disabled, 'element disabled')
  setAttribute(DOMElement, 'disabled', false)
  t.assert(!DOMElement.disabled, 'element unchecked')
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
  DOMElement = document.createElement('div')
  setAttribute(DOMElement, 'innerHTML', '<span></span>')
  t.equal(DOMElement.innerHTML, '<span></span>', 'innerHTML set')
  setAttribute(DOMElement, 'innerHTML', '')
  t.equal(DOMElement.innerHTML, '', 'innerHTML removed')
  setAttribute(DOMElement, 'class', el => 'bar')
  t.equal(DOMElement.className, 'bar', 'function as a value')
  t.end()
})

test('creating DOM elements from virtual elements', t => {
  let DOMElement

  DOMElement = createElement(<div color='red' />)
  t.assert(isDOM(DOMElement), 'is DOM element')
  t.equal(DOMElement.tagName, 'DIV', 'is correct tag')
  t.equal(DOMElement.getAttribute('color'), 'red', 'has attributes')

  DOMElement = createElement(h('#text', { nodeValue: 'Hello World' }))
  t.equal(DOMElement.nodeType, 3, 'is a text element')
  t.equal(DOMElement.data, 'Hello World', 'has text content')

  DOMElement = createElement(<div><span color='red' /></div>)
  t.equal(DOMElement.children.length, 1, 'has children')
  t.equal(DOMElement.innerHTML, '<span color="red"></span>', 'has correct content')

  DOMElement = createElement(<input type='text' value='foo' disabled />)
  t.equal(DOMElement.tagName, 'INPUT', 'is correct tag')
  t.equal(DOMElement.type, 'text', 'is a text input')
  t.equal(DOMElement.value, 'foo', 'has a value')
  t.equal(DOMElement.disabled, true, 'is disabled')

  let MyButton = ({ attributes, context, path, children }) => {
    return <button name={attributes.name} color={context.theme} path={path}>{children[0]}</button>
  }

  DOMElement = createElement(<MyButton name='foo'>Submit</MyButton>, { theme: 'red' }, '0.5')
  t.equal(DOMElement.tagName, 'BUTTON', 'is correct tag')
  t.equal(DOMElement.getAttribute('name'), 'foo', 'has attributes')
  t.equal(DOMElement.getAttribute('color'), 'red', 'has context')
  t.equal(DOMElement.getAttribute('path'), '0.5', 'has path')
  t.equal(DOMElement.innerHTML, 'Submit', 'has text content')

  t.end()
})

test('diffing two elements', t => {
  let {addAttribute, updateAttribute, removeAttribute, insertChild, updateChild, removeChild} = actions
  let span = <span />
  let div = <div />

  t.deepEqual(
    diffNode(<div />, <div color='red' />),
    [addAttribute('color', 'red')],
    'add attribute action'
  )

  t.deepEqual(
    diffNode(<div color='red' />, <div color='blue' />),
    [updateAttribute('color', 'blue', 'red')],
    'update attribute action'
  )

  t.deepEqual(
    diffNode(<div color='red' />, <div />),
    [removeAttribute('color', 'red')],
    'remove attribute action'
  )

  t.deepEqual(
    diffNode(<div color='red' />, <div color={false} />),
    [updateAttribute('color', 'red', false)],
    'update attribute action with false'
  )

  t.deepEqual(
    diffNode(<div color='red' />, <div color={null} />),
    [updateAttribute('color', null, 'red')],
    'update attribute action with null'
  )

  t.deepEqual(
    diffNode(<div color='red' />, <div color={undefined} />),
    [updateAttribute('color', undefined, 'red')],
    'update attribute action with undefined'
  )

  t.deepEqual(
    diffNode(<div color='red' />, <div color='red' />),
    [],
    'no actions for same attribute values'
  )

  t.deepEqual(
    diffNode(<div/>, <div>hello</div>),
    [insertChild(h('#text', { nodeValue: 'hello' }), 0)],
    'insert text child action'
  )

  t.deepEqual(
    diffNode(<div>Hello</div>, <div>Goodbye</div>),
    [updateChild([updateAttribute('nodeValue', 'Hello')], 0)],
    'update text child action'
  )

  t.equal(
    diffNode(div, div),
    [],
    'equal elements'
  )

  t.deepEqual(
    diffNode(<div></div>, <div>{span}</div>),
    [insertChild(span, 0)],
    'insert element child'
  )

  t.deepEqual(
    diffNode(<div>{span}</div>, <div/>),
    [removeChild(span, 0)],
    'remove child action'
  )

  t.end()
})

test('updating keyed child elements', t => {
  let {removeChild, insertChild, updateChild, moveChild} = actions
  let span = <span />

  let actual = diffNode(
    <div>
      <span />
      <span key='foo' />
    </div>,
    <div>
      <span key='foo' />
      <span />
    </div>
  )

  let expected = [
    removeChild(span, 0),
    insertChild(span, 1),
    moveChild(1, 0),
    updateChild([], 0)
  ]

  t.deepEqual(actual, expected, 'move child action')
  t.end()
})

test('updating keyed child thunks', t => {
  let {updateChild, updateThunk} = actions
  let MyButton = m => <button>{m.children}</button>
  let left = <MyButton color='red' key='foo' />
  let right = <MyButton color='blue' key='foo' />

  let actual = diffNode(<div>{left}</div>, <div>{right}</div>)

  let expected = [
    updateChild([updateThunk(left, right, '0.foo')], 0)
  ]

  t.deepEqual(actual, expected, 'update custom element')
  t.end()
})

test('patching element attributes', t => {
  let {addAttribute, updateAttribute, removeAttribute} = actions
  let DOMElement = createElement(<div/>)

  patch(DOMElement, [addAttribute('color', 'red')])
  t.equal(DOMElement.getAttribute('color'), 'red', 'add attribute')

  patch(DOMElement, [updateAttribute('color', 'blue')])
  t.equal(DOMElement.getAttribute('color'), 'blue', 'update attribute')

  patch(DOMElement, [updateAttribute('color', false)])
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with false')

  patch(DOMElement, [addAttribute('color', 'red'), updateAttribute('color', null, 'red')])
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with null')

  patch(DOMElement, [addAttribute('color', 'red'), updateAttribute('color', undefined, 'red')])
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with undefined')

  patch(DOMElement, [removeAttribute('color')])
  t.equal(DOMElement.getAttribute('color'), null, 'remove attribute')

  t.end()
})

test('patching element children', t => {
  let {insertChild, updateChild, removeChild, updateText, moveChild, addAttribute} = actions
  let DOMElement = createElement(<div/>)

  patch(DOMElement, [
    insertChild('Hello', 0)
  ])
  t.equal(DOMElement.innerHTML, 'Hello', 'text child inserted')

  patch(DOMElement, [
    updateChild([updateText('Goodbye')], 0)
  ])
  t.equal(DOMElement.innerHTML, 'Goodbye', 'text child updated')

  patch(DOMElement, [
    removeChild('Goodbye', 0)
  ])
  t.equal(DOMElement.innerHTML, '', 'text child removed')

  patch(DOMElement, [
    insertChild(<span>Hello</span>, 0)
  ])
  t.equal(DOMElement.innerHTML, '<span>Hello</span>', 'element child inserted')

  patch(DOMElement, [
    updateChild([addAttribute('color', 'blue')], 0)
  ])
  t.equal(DOMElement.innerHTML, '<span color="blue">Hello</span>', 'element child updated')

  patch(DOMElement, [
    removeChild(<span>Hello</span>, 0)
  ])
  t.equal(DOMElement.innerHTML, '', 'element child removed')

  patch(DOMElement, [
    insertChild(<span>0</span>, 0),
    insertChild(<span>1</span>, 1),
    insertChild(<span>2</span>, 2)
  ])
  t.equal(DOMElement.childNodes.length, 3, 'multiple children added')

  patch(DOMElement, [
    removeChild(<span>0</span>, 0),
    moveChild(1, 2)
  ])
  t.equal(DOMElement.innerHTML, '<span>2</span><span>1</span>', 'element moved')

  t.end()
})

test('rendering native DOM elements', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  render(<span />)
  t.equal(el.innerHTML, '<span></span>', 'no attribute')
  render(<div><span /></div>)
  t.equal(el.innerHTML, '<div><span></span></div>')
  render(<div><div /></div>)
  t.equal(el.innerHTML, '<div><div></div></div>')
  t.end()
})

test('not touching the DOM', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  render(<span name='Bob' />)
  el.children[0].setAttribute = () => t.fail('DOM was touched')
  render(<span name='Bob' />)
  t.pass('DOM not accessed')
  t.end()
})

test('rendering HTML attributes', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
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

test('rendering text nodes', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
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

test('not destroying parent elements', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  render(<div/>)
  let rootEl = el.firstChild
  render(<div>Hello Pluto</div>)
  t.equal(el.firstChild, rootEl, 'not replaced')
  render(<span>Foo!</span>)
  t.notEqual(el.firstChild, rootEl, 'replaced')
  t.end()
})

test('rendering thunks', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  var MyButton = m => <button>{m.attributes.text}</button>
  MyButton.onCreate = (model, el) => t.pass('onCreate')
  MyButton.onUpdate = (model, el) => t.pass('onUpdate')
  // MyButton.onRemove = el => t.assert(el)
  render(<MyButton text='hello' />)
  render(<MyButton text='goodbye' />)
  render(<div />)
  t.end()
})

test('patching thunks', t => {
  let MyButton = m => <button>{m.attributes.text}</button>
  let el = document.createElement('div')
  let render = createRenderer(el)
  render(<div><MyButton text='Reset' key='foo' /></div>)
  render(<div><MyButton text='Submit' key='foo' /></div>)
  t.equal(el.innerHTML, '<div><button>Submit</button></div>', 'element update')
  t.end()
})

test('context should be passed into all thunks', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  let rootContext = { color: 'red' }
  let Container = (m) => <div>{m.children}</div>
  let MyButton = ({ context, attributes }) => {
    t.equal(rootContext, context, 'rendered with context')
    return <button>{attributes.text}</button>
  }
  t.plan(1)
  render(<Container><MyButton text='hello' /></Container>, rootContext)
  t.end()
})

test('removing sibling elements', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  render(
    <div>
      <span>one</span>
      <span>two</span>
      <span>three</span>
    </div>
  )
  let span = el.firstChild.firstChild
  let rootEl = el.firstChild
  render(
    <div>
      <span>one</span>
    </div>
  )
  t.equal(el.firstChild.firstChild, span, 'child element not replaced')
  t.equal(rootEl.childNodes.length, 1, 'siblings removed')
  t.equal(el.firstChild, rootEl, 'root element not replaced')
  t.end()
})

test('input value', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  render(<input/>)
  var input = el.firstChild
  render(<input value='Bob' />)
  t.equal(input.value, 'Bob', 'value property set')
  render(<input value='Tom' />)
  t.equal(input.value, 'Tom', 'value property updated')
  render(<input />)
  t.equal(input.value, '', 'value property removed')
  t.end()
})

test('cursor position', t => {
  let el = document.createElement('div')
  document.body.appendChild(el)
  let render = createRenderer(el)
  render(<input />)
  let input = el.firstChild
  // Cursor position
  render(<input type='text' value='Game of Thrones' />)
  input.focus()
  input.setSelectionRange(5, 7)
  render(<input type='text' value='Way of Kings' />)
  t.equal(input.selectionStart, 5, 'selection start')
  t.equal(input.selectionEnd, 7, 'selection end')
  // Cursor on some fields, this throws an error in the
  // browser if we haven't checked for the types correctly.
  render(<input type='email' value='a@b.com' />)
  // Remove focus
  if (input.setActive) {
    document.body.setActive()
  } else {
    input.blur()
  }
  // The selection should have changed
  render(<input type='text' value='Hello World!' />)
  t.notEqual(input.selectionStart, 5, 'selection start')
  t.notEqual(input.selectionEnd, 7, 'selection end')
  document.body.removeChild(el)
  t.end()
})

test('input boolean attributes', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  render(<input />)
  let input = el.firstChild
  // Checked
  render(<input checked={true} />)
  t.ok(input.checked, 'checked with a true value')
  t.equal(input.getAttribute('checked'), null, 'has checked attribute')
  render(<input checked={false} />)
  t.ok(!input.checked, 'unchecked with a false value')
  t.ok(!input.hasAttribute('checked'), 'has no checked attribute')
  render(<input checked />)
  t.ok(input.checked, 'checked with a boolean attribute')
  t.equal(input.getAttribute('checked'), null, 'has checked attribute')
  render(<input />)
  t.ok(!input.checked, 'unchecked when attribute is removed')
  t.ok(!input.hasAttribute('checked'), 'has no checked attribute')
  // Disabled
  render(<input disabled={true} />)
  t.ok(input.disabled, 'disabled with a true value')
  t.equal(input.hasAttribute('disabled'), true, 'has disabled attribute')
  render(<input disabled={false} />)
  t.equal(input.disabled, false, 'disabled is false with false value')
  t.equal(input.hasAttribute('disabled'), false, 'has no disabled attribute')
  render(<input disabled />)
  t.ok(input.disabled, 'disabled is true with a boolean attribute')
  t.equal(input.hasAttribute('disabled'), true, 'has disabled attribute')
  render(<input />)
  t.equal(input.disabled, false, 'disabled is false when attribute is removed')
  t.equal(input.hasAttribute('disabled'), false, 'has no disabled attribute')
  t.end()
})

test('option[selected]', t => {
  let options
  let el = document.createElement('div')
  let render = createRenderer(el)
  render(
    <select>
      <option selected>one</option>
      <option>two</option>
    </select>
  )
  options = el.querySelectorAll('option')
  t.ok(!options[1].selected, 'is not selected')
  t.ok(options[0].selected, 'is selected')
  render(
    <select>
      <option>one</option>
      <option selected>two</option>
    </select>
  )
  options = el.querySelectorAll('option')
  t.ok(!options[0].selected, 'is not selected')
  t.ok(options[1].selected, 'is selected')
  t.end()
})

test('higher-order components should have an element', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  var Box = model => <div>{model.attributes.text}</div>
  var Container = model => <Box text='hello' />
  Container.onCreate = (model, el) => {
    t.assert(el, 'element exists')
  }
  render(<Container />)
  t.end()
})

test('memoizing the render function', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  var i = 0
  var vnode = <div onUpdate={el => i++} />
  var Component = model => vnode
  render(<Component />)
  render(<Component />)
  t.equal(i, 1, 'component not updated')
  t.end()
})

test('changing the root node', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  var ComponentA = model => h(model.attributes.type, null, model.attributes.text)
  var Test = model => <ComponentA type={model.attributes.type} text={model.attributes.text} />
  render(<Test type='span' text='test' />)
  t.equal(el.innerHTML, '<span>test</span>')
  render(<Test type='div' text='test' />)
  t.equal(el.innerHTML, '<div>test</div>')
  render(<Test type='div' text='foo' />)
  t.equal(el.innerHTML, '<div>foo</div>')
  t.end()
})

// test.skip('moving components with keys', t => {
//   let el = document.createElement('div')
//   let render = createRenderer(el)
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

test('event handlers', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  let count = 0
  let Page = (model) => <span onClick={model.attributes.clicker} />
  render(<Page clicker={e => count += 1} />)
  trigger(el.firstChild, 'click')
  t.equal(count, 1, 'event added')
  render(<Page clicker={e => count -= 1} />)
  trigger(el.firstChild, 'click')
  t.equal(count, 0, 'event updated')
  render(<Page />)
  trigger(el.firstChild, 'click')
  t.equal(count, 0, 'event removed')
  t.end()
})

test('replacing nodes in the DOM', t => {
  t.end()
})

test('rendering HTML strings', t => {
  t.end()
})
