/** @jsx h */
import test from 'tape'
import {diffChildren, Actions} from '../src/diff'
import h, {createTextElement} from '../src/element'

test('diffChildren', t => {
  let {insertChild, removeChild, updateChild, setAttribute, updateChildren} = Actions

  t.deepEqual(
    diffChildren(<div/>, <div>hello</div>),
    updateChildren([
      insertChild(createTextElement('hello'), 0, '.0')
    ]),
    'insert text'
  )

  t.deepEqual(
    diffChildren(<div>Hello</div>, <div>Goodbye</div>),
    updateChildren([
      updateChild(0, [
        setAttribute('nodeValue', 'Goodbye', 'Hello')
      ])
    ]),
    'update text'
  )

  t.deepEqual(
    diffChildren(<div></div>, <div><span /></div>),
    updateChildren([
      insertChild(<span />, 0, '.0')
    ]),
    'insert element'
  )

  t.deepEqual(
    diffChildren(<div><span /></div>, <div/>),
    updateChildren([
      removeChild(0)
    ]),
    'remove element'
  )

  t.end()
})
