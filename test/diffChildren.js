/** @jsx h */
import test from 'tape'
import {diffChildren} from '../src/diff'
import * as actions from '../src/actions'
import h, {createTextElement} from '../src/element'

test('diffChildren', t => {
  let {insertChild, removeChild, updateChild, setAttribute} = actions

  t.deepEqual(
    diffChildren(<div/>, <div>hello</div>),
    [insertChild(createTextElement('hello'), 0)],
    'insert text'
  )

  t.deepEqual(
    diffChildren(<div>Hello</div>, <div>Goodbye</div>),
    [updateChild(0, [setAttribute('nodeValue', 'Goodbye', 'Hello')])],
    'update text'
  )

  t.deepEqual(
    diffChildren(<div></div>, <div><span /></div>),
    [insertChild(<span />, 0)],
    'insert element'
  )

  t.deepEqual(
    diffChildren(<div><span /></div>, <div/>),
    [removeChild(<span />, 0)],
    'remove element'
  )

  t.end()
})

test.skip('diffChildren (move)', t => {
  let {removeChild, insertBefore, insertChild} = actions

  let actual = diffChildren(
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
    insertBefore(<span key='foo' />, 1, 0),
    insertChild(<span />, '0.1', 1),
    removeChild(<span />, 2)
  ]

  t.deepEqual(actual, expected, 'move children')
  t.end()
})
