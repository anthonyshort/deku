/** @jsx h */
import test from 'tape'
import {diffAttributes, Actions} from '../src/diff'
import {create as h} from '../src/element'
let {setAttribute, removeAttribute} = Actions

test('diffAttributes', t => {
  t.deepEqual(
    diffAttributes(<div />, <div color='red' />),
    [setAttribute('color', 'red', undefined)],
    'add attribute action'
  )

  t.deepEqual(
    diffAttributes(<div color='red' />, <div color='blue' />),
    [setAttribute('color', 'blue', 'red')],
    'update attribute action'
  )

  t.deepEqual(
    diffAttributes(<div color='red' />, <div />),
    [removeAttribute('color', 'red')],
    'remove attribute action'
  )

  t.deepEqual(
    diffAttributes(<div color='red' />, <div color={false} />),
    [setAttribute('color', false, 'red')],
    'update attribute action with false'
  )

  t.deepEqual(
    diffAttributes(<div color='red' />, <div color={null} />),
    [setAttribute('color', null, 'red')],
    'update attribute action with null'
  )

  t.deepEqual(
    diffAttributes(<div color='red' />, <div color={undefined} />),
    [setAttribute('color', undefined, 'red')],
    'update attribute action with undefined'
  )

  t.deepEqual(
    diffAttributes(<div color='red' />, <div color='red' />),
    [],
    'no actions for same attribute values'
  )

  t.deepEqual(
    diffAttributes(<input value='red' />, <input value={0} />),
    [setAttribute('value', 0, 'red')],
    'update input value with zero value'
  )

  t.end()
})
