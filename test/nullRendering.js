/** @jsx h */
import test from 'tape'
import createDOMRenderer from '../src/dom/createRenderer'
import h from '../src/element'

test('rendering nulls as nothing', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<span>{null}</span>)
  t.equal(
    el.innerHTML,
    '<span></span>',
    'null rendered correctly'
  )
  t.end()
})

test('rendering undefineds as nothing', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<span>{undefined}</span>)
  t.equal(
    el.innerHTML,
    '<span></span>',
    'undefined rendered correctly'
  )
  t.end()
})

test('rendering empty strings as nothing', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<span>{''}</span>)
  t.equal(
    el.innerHTML,
    '<span></span>',
    'empty strings rendered correctly'
  )
  t.end()
})

test('rendering empty arrays as nothing', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<span>{[]}</span>)
  t.equal(
    el.innerHTML,
    '<span></span>',
    'empty strings rendered correctly'
  )
  t.end()
})

test.skip('rendering nulls from components', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  let Component = { render: () => null }

  render(<span><Component /></span>)
  t.equal(
    el.innerHTML,
    '<span></span>',
    'null rendered correctly'
  )
  t.end()
})
