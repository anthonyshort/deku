/** @jsx h */
import test from 'tape'
import createDOMRenderer from '../src/dom/createRenderer'
import h from '../src/element'

test('rendering elements', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  render(<span />)
  t.equal(el.innerHTML, '<span></span>', 'rendered')

  render(<span name='Tom' />)
  t.equal(el.innerHTML, '<span name="Tom"></span>', 'attributed added')

  render(<div><span /></div>)
  t.equal(el.innerHTML, '<div><span></span></div>', 'root replaced')

  render(<div><div /></div>)
  t.equal(el.innerHTML, '<div><div></div></div>', 'child replaced')

  render()
  t.equal(el.innerHTML, '', 'root removed')

  render(<div>Hello</div>)
  t.equal(el.innerHTML, '<div>Hello</div>', 'root added')

  t.end()
})

test('moving elements using keys', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  render(
    <div>
      <span id='1' />
      <span id='2' key='foo' />
      <span id='3' />
    </div>
  )

  let span = el.childNodes[0].childNodes[1]

  render(
    <div>
      <span id='2' key='foo' />
      <span id='1' />
      <span id='3' />
    </div>
  )

  t.equal(
    el.innerHTML,
    `<div><span id="2"></span><span id="1"></span><span id="3"></span></div>`,
    'elements rearranged'
  )

  t.equal(
    span,
    el.childNodes[0].childNodes[0],
    'element is moved'
  )

  t.end()
})

test('emptying the container', t => {
  let el = document.createElement('div')
  el.innerHTML = '<div></div>'
  let render = createDOMRenderer(el)
  render(<span></span>)
  t.equal(
    el.innerHTML,
    '<span></span>',
    'container emptied'
  )
  t.end()
})

test('context should be passed down all elements', t => {
  let Form = {
    render ({ props, context }) {
      return <div>
        <h2>My form</h2>
        <div>
          <Button label='press me!' />
        </div>
      </div>
    }
  }

  let Button = {
    render ({ props, context }) {
      t.equal(context.hello, 'there')
      return <button>{ props.label }</button>
    }
  }

  let render = createDOMRenderer(document.body)
  t.plan(1)
  render(<Form />, { hello: 'there' })
  t.end()
})
