/** @jsx h */
import test from 'tape'
import {diffNode, Actions} from '../../src/diff'
import {create as h, createTextElement} from '../../src/element'

test('diffing the same nodes should bail', t => {
  let node = <div />
  let changes = diffNode(node, node)
  t.deepEqual(changes, [Actions.sameNode()], 'skipped node')
  t.end()
})

test('diffing nodes with different types', t => {
  let {replaceNode} = Actions
  let left = <div />
  let right = <span />
  t.deepEqual(
    diffNode(left, right),
    [
      replaceNode(left, right, undefined)
    ],
    'replaced node'
  )
  t.end()
})

test('diffing node with null', t => {
  let {removeNode} = Actions
  let left = <div />
  let right = null
  t.deepEqual(
    diffNode(left, right, '0'),
    [removeNode(left)],
    'removed node'
  )
  t.end()
})

test('diffing node with undefined', t => {
  let {removeNode} = Actions
  let left = <div />
  let right
  t.deepEqual(
    diffNode(left, right, '0'),
    [removeNode(left)],
    'removed node'
  )
  t.end()
})

test('diffing text nodes', t => {
  let {setAttribute} = Actions
  let left = createTextElement('Hello')
  let right = createTextElement('Goodbye')
  t.deepEqual(
    diffNode(left, right, '0'),
    [setAttribute('nodeValue', 'Goodbye', 'Hello')],
    'updated text'
  )
  t.end()
})

test('diffing with a current node should throw an error', t => {
  let left = null
  let right = <div />
  try {
    diffNode(left, right, '0')
    t.fail('error not thrown')
  } catch (e) {
    t.equal(e.message, 'Left node must not be null or undefined')
  }
  t.end()
})

test('diffing two nodes should diff attributes then children', t => {
  let {setAttribute, insertChild, updateChildren} = Actions
  let left = <div />
  let right = <div name='Tom'><span /></div>
  t.deepEqual(
    diffNode(left, right, '0'),
    [
      setAttribute('name', 'Tom', undefined),
      updateChildren([
        insertChild(<span />, 0, '0.0')
      ])
    ]
  )
  t.end()
})

test('diffing thunks', t => {
  let {updateThunk, replaceNode} = Actions
  let renderDiv = () => <div />
  let renderSpan = () => <span />
  let One = { render: renderDiv }
  let Three = { render: renderSpan }
  let one = <One />
  let two = <One />
  let three = <Three />

  t.deepEqual(
    diffNode(one, two, '0'),
    [
      updateThunk(one, two, '0')
    ],
    'update thunks of the same type'
  )

  t.deepEqual(
    diffNode(one, three, '0'),
    [
      replaceNode(one, three, '0')
    ],
    'replace thunks of the different types'
  )

  t.end()
})
