import test from 'tape'
import {createDOMRenderer} from '../src/createDOMRenderer'
import h from '../src/element'

test('Root node should remain the same', t => {
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

test('Swapping out the root node', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
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
