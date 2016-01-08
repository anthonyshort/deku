/** @jsx h */
import test from 'tape'
import h from '../src/element'

test('element', t => {
  let vnode = h('div')

  t.deepEqual(vnode, {
    attributes: {},
    children: [],
    key: undefined,
    type: 'div'
  })

  t.end()
})

test('element with attributes', t => {
  let vnode = h('div', {name: 'John'})

  t.deepEqual(vnode, {
    attributes: {name: 'John'},
    children: [],
    key: undefined,
    type: 'div'
  })

  t.end()
})

test('element with attributes and key', t => {
  let vnode = h('div', {name: 'John', key: '$key$'})

  t.deepEqual(vnode, {
    attributes: {name: 'John'},
    children: [],
    key: '$key$',
    type: 'div'
  })

  t.end()
})

test('element with single string child', t => {
  let vnode = h('div', null, 'test')

  t.deepEqual(vnode, {
    attributes: {},
    children: [
      {
        nodeValue: 'test',
        type: '#text'
      }
    ],
    key: undefined,
    type: 'div'
  })

  t.end()
})

test('element with array containing string child', t => {
  let vnode = h('div', null, ['test'])

  t.deepEqual(vnode, {
    attributes: {},
    children: [
      {
        nodeValue: 'test',
        type: '#text'
      }
    ],
    key: undefined,
    type: 'div'
  })

  t.end()
})
