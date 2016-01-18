/* eslint-disable react/prop-types */

/** @jsx h */
import test from 'tape'
import createDOMRenderer from '../src/dom/createRenderer'
import h from '../src/element'

test('switching components around to null nodes', t => renderTest((el, render) => {
  let One = {
    render: () => <span>1</span>
  }

  let Two = {
    render: () => <b>2</b>
  }

  let App = {
    render: ({ props }) => {
      // switching `null` to `undefined` works.
      return <div>
        { props.one ? <One /> : null }
        { props.two ? <Two /> : null }
      </div>
    }
  }

  render(<App one />)
  t.equal(el.innerHTML, '<div><span>1</span></div>')
  render(<App two />)
  t.equal(el.innerHTML, '<div><b>2</b></div>')
  render(<App one two />)
  t.equal(el.innerHTML, '<div><span>1</span><b>2</b></div>')
  t.end()
}))

function renderTest (fn) {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  fn(el, render)
}

