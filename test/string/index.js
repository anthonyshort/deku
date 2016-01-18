/** @jsx h */
import test from 'tape'
import {string, h} from '../../src'
const {render} = string

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

test('render empty nodes to a string', t => {
  t.equal(
    render(
      <div>
        {null}
      </div>
    ),
    '<div><noscript></noscript></div>',
    'noscript rendered'
  )
  t.end()
})

test('render innerHTML to a string', t => {
  t.equal(
    render(<div innerHTML='<span>foo</span>' />),
    '<div><span>foo</span></div>',
    'innerHTML rendered'
  )
  t.end()
})

test('render input.value to a string', t => {
  t.equal(
    render(<input value='foo' />),
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
    render(<input type='checkbox' value='' />),
    '<input type="checkbox" value=""></input>',
    'empty string attribute not rendered'
  )

  t.equal(
    render(<input type='checkbox' value={0} />),
    '<input type="checkbox" value="0"></input>',
    'zero attribute not rendered'
  )

  t.equal(
    render(<input type='checkbox' disabled={false} />),
    '<input type="checkbox"></input>',
    'false attribute not rendered'
  )

  t.equal(
    render(<input type='checkbox' disabled={null} />),
    '<input type="checkbox"></input>',
    'null attribute not rendered'
  )

  t.equal(
    render(<input type='checkbox' disabled={undefined} />),
    '<input type="checkbox"></input>',
    'undefined attribute not rendered'
  )

  t.end()
})

test('render thunks to a string', t => {
  let Component = {
    render: (model) => (
      <div>{model.props.name}</div>
    )
  }

  t.equal(
    render(<Component name='Tom' />),
    '<div>Tom</div>',
    'Root level component rendered'
  )

  t.end()
})

test('render thunks with children to a string', t => {
  let Component = {
    render: (model) => (
      <div path={model.path}>{model.children}</div>
    )
  }

  t.equal(
    render(
      <Component>
        <div>Tom</div>
      </Component>
    ),
    '<div path="0"><div>Tom</div></div>',
    'rendered html'
  )

  t.equal(
    render(
      <Component>
        <div>
          <Component key='foo'>
            <span>Tom</span>
          </Component>
        </div>
      </Component>
    ),
    '<div path="0"><div><div path="0.0.foo"><span>Tom</span></div></div></div>',
    'rendered html'
  )

  t.end()
})

test('context should be passed down all elements when rendered as a string', t => {
  let Form = {
    render ({ props, context }) {
      return <div>
        <h2>My form</h2>
        <div>
          <Button label='press me!' />
        </div>
      </div>
    }
  }
  let Button = {
    render ({ props, context }) {
      return <button>{context.hello}</button>
    }
  }
  t.equal(
    render(<Form />, { hello: 'there' }),
    `<div><h2>My form</h2><div><button>there</button></div></div>`
  )
  t.end()
})
