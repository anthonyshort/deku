/** @jsx h */
import test from 'tape'
import {diffChildren, Actions} from '../src/diff'
import h, {createTextElement} from '../src/element'

test('diffChildren', t => {
  let {insertChild, removeChild, updateChild, setAttribute} = Actions

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

test('diffChildren (move)', t => {
  let {removeChild, insertBefore, insertChild} = Actions

  let actual = diffChildren(
    <div>
      <span />
      <span key='foo' />
      <span />
    </div>,
    <div>
      <span key='foo' />
      <span />
      <span />
    </div>
  )

  let expected = [
    insertBefore(0),
    insertChild(<span />, 1),
    removeChild(<span />, 0)
  ]

  t.deepEqual(actual, expected, 'move children')
  t.end()
})
