/** @jsx h */
import {groupByKey} from '../src/shared/utils'
import h from '../src/element'
import test from 'tape'

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
