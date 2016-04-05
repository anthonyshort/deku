/** @jsx h */
import test from 'tape'
import {create as h, groupByKey} from '../../src/element'

test('Element should accept strings as children', t => {
  let vnode = h('span', {}, ['Hello'])
  t.assert(
    vnode.children[0].type === 'text'
  )
  t.end()
})

test('should not allow undefined as a vnode type', t => {
  try {
    h('span', {}, [undefined])
    t.fail()
  } catch (e) {
    t.pass('undefined not allowed')
  } finally {
    t.end()
  }
})

test('groupByKey', t => {
  let one = <div/>
  let two = <div key='foo'/>
  let three = <div/>
  let result = groupByKey([one, two, three, undefined, null, 'foo'])
  t.deepEqual(result, [
    { key: '0', item: one, index: 0 },
    { key: 'foo', item: two, index: 1 },
    { key: '2', item: three, index: 2 },
    { key: '4', item: null, index: 4 },
    { key: '5', item: 'foo', index: 5 }
  ])
  t.end()
})

test('should alias the className attribute to class', t => {
  let vnode = h('span', { className: 'foo-bar-baz' }, [])
  t.assert(
    vnode.attributes.class == 'foo-bar-baz',
    'attribute named "className" is now named "class"'
  )
  t.assert(
    vnode.attributes.className === undefined,
    'attribute named "className" is now undefined'
  )
  t.end()
})
