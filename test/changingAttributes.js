/* eslint-disable react/prop-types */

/** @jsx h */
import test from 'tape'
import createDOMRenderer from '../src/dom/createRenderer'
import h from '../src/element'

test('changing attributes', t => renderTest((el, render) => {
  let App = {
    render: ({ props, children }) => {
      return <div>
        <input type={ props.type } />
        {children}
      </div>
    }
  }

  render(<App type='text' />)
  t.equal(el.innerHTML, '<div><input type="text"></div>', 'renders')
  render(<App type='checkbox' />)
  t.equal(el.innerHTML, '<div><input type="checkbox"></div>', 'updates attributes')
  render(<App><b>hi</b></App>)
  t.equal(el.innerHTML, '<div><input><b>hi</b></div>', 'changes children')
  render(<App><em>hi</em></App>)
  t.equal(el.innerHTML, '<div><input><em>hi</em></div>', 'changes children again')
  render(<App type='checkbox' />)
  t.equal(el.innerHTML, '<div><input type="checkbox"></div>', 'changes back')
  t.end()
}))

test('changing attributes', t => renderTest((el, render) => {
  let App = {
    render: ({ props }) => {
      return <div><input {...props} /></div>
    }
  }

  render(<App type='text' />)
  t.equal(el.innerHTML, '<div><input type="text"></div>', 'renders')
  render(<App type='checkbox' />)
  t.equal(el.innerHTML, '<div><input type="checkbox"></div>', 'updates type')
  render(<App type='checkbox' />)
  t.equal(el.innerHTML, '<div><input type="checkbox"></div>', 'doesn\'t do anything')
  render(<App value='hello' />)
  t.equal(el.innerHTML, '<div><input value="hello"></div>', 'removes the type attribute')
  render(<App type='checkbox' value='hello' />)
  t.equal(el.innerHTML, '<div><input value="hello" type="checkbox"></div>', 'preserves value and adds type')
  t.end()
}))

function renderTest (fn) {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  fn(el, render)
}

