/** @jsx h */

require('babelify/polyfill')

import test from 'tape'
import h from 'virtual-element'
import isDOM from 'is-dom'
import {createRenderer, renderString, groupByKey, diff, patch, updateAttribute, createElement} from '../'

test('grouping virtual nodes', t => {
  let one = <div/>
  let two = <div key="foo"/>
  let three = <div/>
  let result = groupByKey([one,two,three,null,'foo'])
  t.equal(result[0].element, one)
  t.equal(result[0].index, 0)
  t.equal(result['foo'].element, two)
  t.equal(result['foo'].index, 1)
  t.equal(result[2].element, three)
  t.equal(result[2].index, 2)
  t.equal(result[3], undefined)
  t.end()
})

test('updating attributes', t => {
  let DOMElement
  DOMElement = document.createElement('input')
  DOMElement.setAttribute('type', 'checkbox')
  updateAttribute(DOMElement, 'checked', true)
  t.assert(DOMElement.checked, 'element checked')
  updateAttribute(DOMElement, 'checked', false)
  t.assert(!DOMElement.checked, 'element unchecked')
  updateAttribute(DOMElement, 'disabled', true)
  t.assert(DOMElement.disabled, 'element disabled')
  updateAttribute(DOMElement, 'disabled', false)
  t.assert(!DOMElement.disabled, 'element unchecked')
  updateAttribute(DOMElement, 'selected', true)
  t.assert(DOMElement.selected, 'element selected')
  updateAttribute(DOMElement, 'selected', false)
  t.assert(!DOMElement.selected, 'element unselected')
  updateAttribute(DOMElement, 'value', 'foo')
  t.equal(DOMElement.value, 'foo', 'value set')
  updateAttribute(DOMElement, 'value', 2)
  t.equal(DOMElement.value, '2', 'value updated')
  updateAttribute(DOMElement, 'value', null)
  t.equal(DOMElement.value, '', 'value removed')
  DOMElement = document.createElement('div')
  updateAttribute(DOMElement, 'innerHTML', '<span></span>')
  t.equal(DOMElement.innerHTML, '<span></span>', 'innerHTML set')
  updateAttribute(DOMElement, 'innerHTML', '')
  t.equal(DOMElement.innerHTML, '', 'innerHTML removed')
  updateAttribute(DOMElement, 'class', el => 'bar')
  t.equal(DOMElement.className, 'bar', 'function as a value')
  t.end()
})

test('creating DOM elements from virtual elements', t => {
  let DOMElement

  DOMElement = createElement(<div color="red" />)
  t.assert(isDOM(DOMElement), 'is DOM element')
  t.equal(DOMElement.tagName, 'DIV', 'is correct tag')
  t.equal(DOMElement.getAttribute('color'), 'red', 'has attributes')

  DOMElement = createElement('Hello World')
  t.equal(DOMElement.nodeType, 3, 'is a text element')
  t.equal(DOMElement.data, 'Hello World', 'has text content')

  DOMElement = createElement(<div><span color="red" /></div>)
  t.equal(DOMElement.children.length, 1, 'has children')
  t.equal(DOMElement.innerHTML, '<span color="red"></span>', 'has correct content')

  DOMElement = createElement(<input type="text" value="foo" disabled />)
  t.equal(DOMElement.tagName, 'INPUT', 'is correct tag')
  t.equal(DOMElement.type, 'text', 'is a text input')
  t.equal(DOMElement.value, 'foo', 'has a value')
  t.equal(DOMElement.disabled, true, 'is disabled')

  let MyButton = (model) => {
    return <button name={model.attributes.name} color={model.context.theme} path={model.path}>{model.children[0]}</button>
  }

  DOMElement = createElement(<MyButton name="foo">Submit</MyButton>, { theme: 'red' }, '0.5')
  t.equal(DOMElement.tagName, 'BUTTON', 'is correct tag')
  t.equal(DOMElement.getAttribute('name'), 'foo', 'has attributes')
  t.equal(DOMElement.getAttribute('color'), 'red', 'has context')
  t.equal(DOMElement.getAttribute('path'), '0.5', 'has path')
  t.equal(DOMElement.innerHTML, 'Submit', 'has text content')

  t.end()
})

test('diffing two elements', t => {
  let actions, element, content

  actions = diff(<div />, <div color="red" />)
  t.deepEqual(actions[0], {
    type: 'addAttribute',
    name: 'color',
    value: 'red'
  }, 'add attribute action')

  actions = diff(<div color="red" />, <div color="blue" />)
  t.deepEqual(actions[0], {
    type: 'updateAttribute',
    name: 'color',
    value: 'blue'
  }, 'update attribute action')

  actions = diff(<div color="red" />, <div />)
  t.deepEqual(actions[0], {
    type: 'removeAttribute',
    name: 'color'
  }, 'remove attribute action')

  actions = diff(<div color="red" />, <div color={false} />)
  t.deepEqual(actions[0], {
    type: 'updateAttribute',
    name: 'color',
    value: false
  }, 'update attribute action with false')

  actions = diff(<div color="red" />, <div color={null} />)
  t.deepEqual(actions[0], {
    type: 'updateAttribute',
    name: 'color',
    value: null
  }, 'update attribute action with null')

  actions = diff(<div color="red" />, <div color={undefined} />)
  t.deepEqual(actions[0], {
    type: 'updateAttribute',
    name: 'color',
    value: undefined
  }, 'update attribute action with undefined')

  actions = diff(<div color="red" />, <div color="red" />)
  t.deepEqual(actions, [], 'no actions for same attribute values')

  element = 'Hello'
  actions = diff(<div/>, <div>{element}</div>)
  t.deepEqual(actions[0], {
    type: 'insertChild',
    element: element,
    index: 0
  }, 'insert text child action')

  actions = diff(<div>Hello</div>, <div>Goodbye</div>)
  t.deepEqual(actions, [{
    type: 'updateChild',
    index: 0,
    actions: [{
      type: 'updateText',
      value: 'Goodbye',
      previousValue: 'Hello'
    }]
  }], 'update text child action')

  element = <div />
  actions = diff(element, element)
  t.equal(actions.length, 0, 'equal elements')

  content = <span />
  actions = diff(<div></div>,<div>{content}</div>)
  t.deepEqual(actions[0], {
    type: 'insertChild',
    element: content,
    index: 0
  }, 'insert child action')

  content = <span />
  actions = diff(<div>{content}</div>,<div/>)
  t.deepEqual(actions, [{
    type: 'removeChild',
    element: content,
    index: 0
  }], 'remove child action')

  content = <span />
  actions = diff(
    <div>
      <span />
      <span key="foo" />
    </div>,
    <div>
      <span key="foo" />
      <span />
    </div>
  )
  t.deepEqual(actions, [{
    type: 'removeChild',
    element: content,
    index: 0
  }, {
    type: 'insertChild',
    element: content,
    index: 1
  }, {
    type: 'moveChild',
    from: 1,
    to: 0
  }], 'move child action')

  t.end()
})

test('patching an element', t => {
  let DOMElement

  DOMElement = createElement(<div/>)
  patch(DOMElement, [{
    type: 'addAttribute',
    name: 'color',
    value: 'red'
  }])
  t.equal(DOMElement.getAttribute('color'), 'red', 'add attribute')

  patch(DOMElement, [{
    type: 'updateAttribute',
    name: 'color',
    value: 'blue'
  }])
  t.equal(DOMElement.getAttribute('color'), 'blue', 'update attribute')

  patch(DOMElement, [{
    type: 'updateAttribute',
    name: 'color',
    value: false
  }])
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with false')

  patch(DOMElement, [{
    type: 'addAttribute',
    name: 'color',
    value: 'red'
  }, {
    type: 'updateAttribute',
    name: 'color',
    value: null
  }])
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with null')

  patch(DOMElement, [{
    type: 'addAttribute',
    name: 'color',
    value: 'red'
  }, {
    type: 'updateAttribute',
    name: 'color',
    value: undefined
  }])
  t.equal(DOMElement.hasAttribute('color'), false, 'remove attribute with undefined')

  patch(DOMElement, [{
    type: 'removeAttribute',
    name: 'color'
  }])
  t.equal(DOMElement.getAttribute('color'), null, 'remove attribute')

  patch(DOMElement, [{
    type: 'insertChild',
    element: 'Hello',
    index: 0
  }])
  t.equal(DOMElement.innerHTML, 'Hello', 'text child inserted')

  patch(DOMElement, [{
    type: 'updateChild',
    index: 0,
    actions: [{
      type: 'updateText',
      value: 'Goodbye'
    }]
  }])
  t.equal(DOMElement.innerHTML, 'Goodbye', 'text child updated')

  patch(DOMElement, [{
    type: 'removeChild',
    index: 0
  }])
  t.equal(DOMElement.innerHTML, '', 'text child removed')

  patch(DOMElement, [{
    type: 'insertChild',
    element: <span>Hello</span>,
    index: 0
  }])
  t.equal(DOMElement.innerHTML, '<span>Hello</span>', 'element child inserted')

  patch(DOMElement, [{
    type: 'updateChild',
    index: 0,
    actions: [{
      type: 'addAttribute',
      name: 'color',
      value: 'blue'
    }]
  }])
  t.equal(DOMElement.innerHTML, '<span color="blue">Hello</span>', 'element child updated')

  patch(DOMElement, [{
    type: 'removeChild',
    index: 0
  }])
  t.equal(DOMElement.innerHTML, '', 'element child removed')

  patch(DOMElement, [{
    type: 'insertChild',
    element: <span>0</span>,
    index: 0
  }, {
    type: 'insertChild',
    element: <span>1</span>,
    index: 1
  }, {
    type: 'insertChild',
    element: <span>2</span>,
    index: 2
  }])
  t.equal(DOMElement.childNodes.length, 3, 'multiple children added')

  patch(DOMElement, [{
    type: 'removeChild',
    element: <span>0</span>,
    index: 0
  }, {
    type: 'moveChild',
    from: 1,
    to: 2
  }])
  t.equal(DOMElement.innerHTML, '<span>2</span><span>1</span>', 'element moved')

  t.end()
})

test('rendering native DOM elements', t => {
  let el = document.createElement('div')
  let render = createRenderer(el)
  t.assert(typeof render === 'function')
  render(<div />)
  t.equal(el.innerHTML, '<div></div>')
  render(<div active={true} />)
  t.equal(el.innerHTML, '<div active="true"></div>')
  render(<div class="button" />)
  t.equal(el.innerHTML, '<div class="button"></div>')
  render(<div class="box" />)
  t.equal(el.innerHTML, '<div class="box"></div>')
  render(<div />)
  t.equal(el.innerHTML, '<div></div>')
  render(<div><span /></div>)
  t.equal(el.innerHTML, '<div><span></span></div>')
  render(<div><div /></div>)
  t.equal(el.innerHTML, '<div><div></div></div>')
  t.end()
})

test('rendering custom DOM elements', t => {
  t.end()
})

test('rendering HTML strings', t => {
  t.end()
})
