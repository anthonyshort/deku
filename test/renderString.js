/** @jsx h */
import test from 'tape'
import render from '../src/renderString'
import h from '../src/element'

test('render to a string', t => {
  t.equal(
    render(
      <div>
        <span>foo</span>
      </div>
    ),
    '<div><span>foo</span></div>',
    'innerHTML rendered'
  )
  t.end()
})

test('render innerHTML to a string', t => {
  t.equal(
    render(<div innerHTML="<span>foo</span>" />),
    '<div><span>foo</span></div>',
    'innerHTML rendered'
  )
  t.end()
})

test('render input.value to a string', t => {
  t.equal(
    render(<input value="foo" />),
    '<input value="foo"></input>',
    'value rendered'
  )
  t.end()
})

test('render event attributes to a string', t => {
  t.equal(
    render(<div onClick={() => 'blah'} />),
    '<div></div>',
    'attribute not rendered'
  )
  t.end()
})

test('render empty attributes to a string', t => {
  t.equal(
    render(<input type="checkbox" value="" />),
    '<input type="checkbox" value=""></input>',
    'empty string attribute not rendered'
  )

  t.equal(
    render(<input type="checkbox" value={0} />),
    '<input type="checkbox" value="0"></input>',
    'zero attribute not rendered'
  )

  t.equal(
    render(<input type="checkbox" disabled={false} />),
    '<input type="checkbox"></input>',
    'false attribute not rendered'
  )

  t.equal(
    render(<input type="checkbox" disabled={null} />),
    '<input type="checkbox"></input>',
    'null attribute not rendered'
  )

  t.equal(
    render(<input type="checkbox" disabled={undefined} />),
    '<input type="checkbox"></input>',
    'undefined attribute not rendered'
  )

  t.end()
})
