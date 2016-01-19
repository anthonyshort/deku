/** @jsx h */
import test from 'tape'
import {diffChildren, Actions} from '../../src/diff'
import {create as h, createTextElement, createEmptyElement} from '../../src/element'

test('diffChildren', t => {
  let {insertChild, removeChild, updateChild, setAttribute, updateChildren, replaceNode} = Actions

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

  t.deepEqual(
    diffChildren(<div><span /></div>, <div>{null}</div>),
    updateChildren([
      updateChild(0, [
        replaceNode(<span />, createEmptyElement(), '.0')
      ])
    ]),
    'remove element with null'
  )

  t.deepEqual(
    diffChildren(<div>{null}</div>, <div>{null}</div>),
    updateChildren([]),
    'updated element with null'
  )

  t.deepEqual(
    diffChildren(<div>{null}</div>, <div><span /></div>),
    updateChildren([
      updateChild(0, [
        replaceNode(createEmptyElement(), <span />, '.0')
      ])
    ]),
    'add element from null'
  )

  t.end()
})
