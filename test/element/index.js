/** @jsx h */
import test from 'tape'
import {create as h, groupByKey} from '../../src/element'

test('Element should accept strings as children', t => {
  let vnode = h('span', {}, ['Hello'])
  t.assert(
    vnode.children[0].type === '#text'
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
  let result = groupByKey([one, two, three, null, 'foo'])
  t.deepEqual(result, [
    { key: '0', item: one, index: 0 },
    { key: 'foo', item: two, index: 1 },
    { key: '2', item: three, index: 2 },
    { key: '4', item: 'foo', index: 4 }
  ])
  t.end()
})
