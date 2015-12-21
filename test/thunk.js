/** @jsx h */
import {createDOMRenderer} from '../src/createDOMRenderer'
import createElement from '../src/createElement'
import h from '../src/element'
import isDOM from 'is-dom'
import test from 'tape'

test('rendering and updating thunks', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ props }) => (
      <div name={props.name} />
    )
  }

  render(<Component name="Tom" />)
  render(<Component name="Bob" />)
  t.equal(el.innerHTML, `<div name="Bob"></div>`, 'thunk updated')

  t.end()
})

test('swapping a thunks root element', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ props }) => (
      props.swap
        ? <a />
        : <b />
    )
  }

  render(<Component />)
  render(<Component swap />)
  t.equal(el.innerHTML, `<a></a>`, 'thunk root element swapped')

  t.end()
})

test('render and update nested thunk', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ props }) => <button>{props.text}</button>
  }

  render(<div><Component text='Reset' /></div>)
  t.equal(el.innerHTML, '<div><button>Reset</button></div>', 'thunk rendered')

  render(<div><Component text='Submit' /></div>)
  t.equal(el.innerHTML, '<div><button>Submit</button></div>', 'thunk updated')

  t.end()
})

// test('calling thunks onCreate hook', t => {
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//
//   let Component = {
//     onCreate: () => t.pass(),
//     render: m => <div />
//   }
//
//   t.plan(1)
//   render(<Component text='Reset' />)
//   t.end()
// })

// test.skip('create element from thunk and call onCreate', t => {
//   t.plan(7)
//   let context = {}
//   let path = '0.5'
//
//   let Component = (model) => {
//     t.equal(model.context, context, 'render has context')
//     t.equal(model.attributes.name, 'foo', 'render has attributes')
//     t.equal(model.path, '0.5', 'render has path')
//     return <button>{model.children[0]}</button>
//   }
//
//   Component.onCreate = (model) => {
//     t.equal(model.path, '0.5')
//     t.equal(model.context, context)
//   }
//
//   let vnode = <Component name='foo'>Submit</Component>
//   let DOMElement = createElement(vnode, context, path)
//   t.equal(DOMElement.tagName, 'BUTTON', 'is correct tag')
//   t.equal(DOMElement.innerHTML, 'Submit', 'has text content')
//
//   t.end()
// })
//
//
// test('render (thunk lifecycle hooks)', t => {
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//   var MyButton = m => <button>{m.attributes.text}</button>
//   MyButton.onCreate = (model, el) => t.pass('onCreate')
//   MyButton.onUpdate = (model, el) => t.pass('onUpdate')
//   // MyButton.onRemove = el => t.assert(el)
//   render(<MyButton text='hello' />)
//   render(<MyButton text='goodbye' />)
//   render(<div />)
//   t.end()
// })
//
// test('render (thunk context)', t => {
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//   let rootContext = { color: 'red' }
//   let Container = (m) => <div>{m.children}</div>
//   let MyButton = ({ context, attributes }) => {
//     t.equal(rootContext, context, 'rendered with context')
//     return <button>{attributes.text}</button>
//   }
//   t.plan(1)
//   render(<Container><MyButton text='hello' /></Container>, rootContext)
//   t.end()
// })
//
// test('higher-order thunks should have an element', t => {
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//   var Box = model => <div>{model.attributes.text}</div>
//   var Container = model => <Box text='hello' />
//   Container.onCreate = (model, el) => {
//     t.assert(el, 'element exists')
//   }
//   render(<Container />)
//   t.end()
// })
