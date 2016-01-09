/** @jsx h */
import createDOMRenderer from '../src/dom/createRenderer'
import h from '../src/element'
import test from 'tape'
import trigger from 'trigger-event'

test('rendering and updating thunks', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: (model) => (
      <div name={model.props.name} />
    )
  }

  render(<Component name='Tom' />)
  render(<Component name='Bob' />)
  t.equal(el.innerHTML, `<div name="Bob"></div>`, 'thunk updated')

  t.end()
})

test('calling dispatch', t => {
  let Component = {
    render: ({ dispatch }) => (
      <button onClick={() => dispatch({ type: 'CLICK' })}>Click</button>
    )
  }

  let el = document.createElement('div')
  document.body.appendChild(el)

  let render = createDOMRenderer(el, action => {
    t.equal(action.type, 'CLICK', 'Action received')
  })

  t.plan(1)
  render(<Component />)
  trigger(el.querySelector('button'), 'click')
  document.body.removeChild(el)
  t.end()
})

test('accessing context', t => {
  let state = {
    name: 'Tom'
  }
  let Component = {
    render: ({ context }) => {
      t.equal(context, state, 'same object is used')
      return <div>{context.name}</div>
    }
  }
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  render(<Component />, state)
  t.equal(el.innerHTML, '<div>Tom</div>')
  t.end()
})

test('swapping a thunks root element', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: (model) => (
      model.props.swap
        ? <a />
        : <b />
    )
  }

  render(<Component />)
  render(<Component swap />)
  t.equal(el.innerHTML, `<a></a>`, 'thunk root element swapped')

  t.end()
})

test('rendering a thunk with props', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: (model) => <button>{model.props.text}</button>
  }

  render(<div><Component text='Reset' /></div>)
  t.equal(el.innerHTML, '<div><button>Reset</button></div>', 'thunk rendered')

  render(<div><Component text='Submit' /></div>)
  t.equal(el.innerHTML, '<div><button>Submit</button></div>', 'thunk updated')

  t.end()
})

test('rendering a thunk with children', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ children }) => children[0]
  }

  render(
    <Component>
      <div>Hello World</div>
    </Component>
  )
  t.equal(el.innerHTML, '<div>Hello World</div>', 'thunk rendered with children')

  t.end()
})

test('rendering a thunk with a path', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)

  let Component = {
    render: ({ path }) => {
      t.assert(path, 'path is correct')
      return <div />
    }
  }

  t.plan(1)
  render(
    <div>
      <ul>
        <li key='one'></li>
        <li key='two'><Component /></li>
        <li key='three'></li>
      </ul>
    </div>
  )
  t.end()
})

test('calling onCreate hook correctly', t => {
  let render = createDOMRenderer()

  let Component = {
    onCreate: () => t.pass('onCreate called'),
    render: m => <div />
  }

  t.plan(1)
  render(<Component />)
  render(<Component />)
  t.end()
})

test('calling onUpdate hook correctly', t => {
  let render = createDOMRenderer()

  let Component = {
    onUpdate: ({ path, props, children }) => {
      t.assert(path, 'path available')
      t.equal(props.name, 'Tom', 'props available')
    },
    render: m => <div />
  }

  t.plan(2)
  render(<Component name='Bob' />)
  render(<Component name='Tom' />)
  t.end()
})

test('calling onRemove hook correctly', t => {
  let render = createDOMRenderer()

  let Component = {
    onRemove: ({ path, props, children }) => {
      t.assert(path, 'path available')
      t.equal(props.name, 'Tom', 'props available')
    },
    render: m => <div />
  }

  t.plan(2)
  render(<Component name='Tom' />)
  render(<div />)
  t.end()
})

test('path should stay the same on when thunk is updated', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  document.body.appendChild(el)
  let MyButton = {
    onUpdate ({path}) {
      t.equal(path, '0.0.0', 'onUpdate')
    },
    render ({path, children}) {
      t.equal(path, '0.0.0', 'onRender')
      return <button onClick={update}>{children}</button>
    }
  }
  let MyWrapper = {
    render ({path}) {
      t.equal(path, '0', 'Wrapper onRender')
      return <div>
        <MyButton>Hello World!</MyButton>
      </div>
    }
  }
  let update = () => {
    render(<MyWrapper />)
  }
  update()
  trigger(el.querySelector('button'), 'click')
  document.body.removeChild(el)
  t.end()
})

test('path should stay the same on when thunk is replaced', t => {
  let el = document.createElement('div')
  let render = createDOMRenderer(el)
  let Thunk = {
    render ({path, children, props}) {
      t.equal(path, props.expectedPath, 'onRender')
      return children[0] || <div/>
    }
  }
  render(<div><span /></div>)
  render(<div><Thunk expectedPath='0.0' /></div>)
  render(<div><span /></div>)
  render(<div></div>)
  render(<div><Thunk expectedPath='0.0'><Thunk expectedPath='0.0.0' /></Thunk></div>)
  t.end()
})
