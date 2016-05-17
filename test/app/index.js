/* eslint-disable react/prop-types */
/** @jsx h */
import test from 'tape'
import {createApp} from '../../src/app'
import {create as h} from '../../src/element'

test('rendering elements', t => {
  let el = document.createElement('div')
  let render = createApp(el)

  render(<span />)
  t.equal(el.innerHTML, '<span></span>', 'rendered')

  render(<span name='Tom' />)
  t.equal(el.innerHTML, '<span name="Tom"></span>', 'attributed added')

  render(<div><span /></div>)
  t.equal(el.innerHTML, '<div><span></span></div>', 'root replaced')

  render(<div><div /></div>)
  t.equal(el.innerHTML, '<div><div></div></div>', 'child replaced')

  render()
  t.equal(el.innerHTML, '', 'root removed')

  render(<div>Hello</div>)
  t.equal(el.innerHTML, '<div>Hello</div>', 'root added')

  t.end()
})

test('moving elements using keys', t => {
  let el = document.createElement('div')
  let render = createApp(el)

  render(
    <div>
      <span id='1' />
      <span id='2' key='foo' />
      <span id='3' />
    </div>
  )

  let span = el.childNodes[0].childNodes[1]

  render(
    <div>
      <span id='2' key='foo' />
      <span id='1' />
      <span id='3' />
    </div>
  )

  t.equal(
    el.innerHTML,
    `<div><span id="2"></span><span id="1"></span><span id="3"></span></div>`,
    'elements rearranged'
  )

  t.equal(
    span,
    el.childNodes[0].childNodes[0],
    'element is moved'
  )

  t.end()
})

// TODO: требуется ли это?
test('emptying the container', t => {
  let el = document.createElement('div')
  el.innerHTML = '<div></div>'
  let render = createApp(el)
  render(<span></span>)
  t.equal(
    el.innerHTML,
    '<span></span>',
    'container emptied'
  )
  t.end()
})

test('context should be passed down all elements', t => {
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
      t.equal(context.hello, 'there')
      return <button>Submit</button>
    }
  }
  let el = document.createElement('div')
  let render = createApp(el)
  t.plan(1)
  render(<Form />, { hello: 'there' })
  t.end()
})

test('context should be passed down across re-renders', t => {
  let Form = {
    render () {
      return <div><Button /></div>
    }
  }
  let Button = {
    render ({ props, context }) {
      t.equal(context, 'the context', 'context is passed down')
      return <button>Submit</button>
    }
  }
  let el = document.createElement('div')
  let render = createApp(el)
  t.plan(2)
  render(<Form />, 'the context')
  render(<Form />, 'the context')
  t.end()
})

test('rendering numbers as text elements', t => {
  let el = document.createElement('div')
  let render = createApp(el)
  render(<span>{5}</span>)
  t.equal(
    el.innerHTML,
    '<span>5</span>',
    'number rendered correctly'
  )
  t.end()
})

test('rendering zero as text element', t => {
  let el = document.createElement('div')
  let render = createApp(el)
  render(<span>{0}</span>)
  t.equal(
    el.innerHTML,
    '<span>0</span>',
    'zero rendered correctly'
  )
  t.end()
})

test('rendering the same node', t => {
  let el = document.createElement('div')
  let render = createApp(el)
  var node = <div></div>
  render(node)
  render(node)
  t.equal(
    el.innerHTML,
    '<div></div>',
    'samenode is handled'
  )
  t.end()
})

test('context should be passed down across re-renders even after disappearance', t => {
  let Form = {
    render ({ props }) {
      return <div>{ props.visible ? <Button /> : [] }</div>
    }
  }
  let Button = {
    render ({ props, context }) {
      t.equal(context, 'the context', 'context is passed down')
      return <button>Submit</button>
    }
  }
  let el = document.createElement('div')
  let render = createApp(el)
  t.plan(2)
  render(<Form visible />, 'the context')
  render(<Form />, 'the context')
  render(<Form visible />, 'the context')
  t.end()
})

test('#339 - removing nodes that contain a text node', t => {
  let el = document.createElement('div')
  let render = createApp(el)

  let ViewOne = {
    render: model => <div>Hi!</div>
  }

  let ViewTwo = {
    render: model => {
      let r = Date.now().toString() + 'dh'
      return <a>{r}</a>
    }
  }

  render(<ViewOne />)
  render(<ViewTwo />)
  t.end()
})

test('#366 - cached vnodes for thunks are correct', t => {
  let el = document.createElement('div')
  let render = createApp(el)

  const data = [
    {id: 1, title: 'la french'},
    {id: 2, title: 'the homesman'},
    {id: 3, title: 'mr. turner'}
  ]

  let Card = {
    render: ({ props }) => {
      return <li id={props.id}>
        <div>{props.title}</div>
      </li>
    }
  }

  let App = {
    render: ({ props }) => {
      return <ul id='strap-list'>
        {data.map((card) => <Card
          key={card.id}
          id={card.id}
          title={card.title}
        />)}
      </ul>
    }
  }

  let vnode = <App />
  render(vnode)

  let ul = vnode.state.vnode

  t.notEqual(
    ul.children[0].state.vnode,
    ul.children[1].state.vnode
  )

  t.end()
})

test('rendering and updating null', t => {
  let el = document.createElement('div')
  let render = createApp(el)

  render(
    <div>
      <div key='one'></div>
      <div key='two'></div>
    </div>
  )
  render(
    <div>
      <div key='one'></div>
      {null}
      <div key='two'></div>
    </div>
  )
  t.equal(el.innerHTML, '<div><div></div><noscript></noscript><div></div></div>', 'empty node added')

  render(
    <div>
      <div key='one'></div>
      <div key='two'></div>
      {null}
    </div>
  )
  t.equal(el.innerHTML, '<div><div></div><div></div><noscript></noscript></div>', 'empty node updated')

  render(
    <div>
      <div key='one'></div>
      <div key='two'></div>
    </div>
  )
  t.equal(el.innerHTML, '<div><div></div><div></div></div>', 'empty node updated')

  t.end()
})

test('rendering in a container with pre-rendered HTML', t => {
  /*
  In the first call to render:
  For container with pre-rendered HTML (i.e. childNodes.length > 0)
    If the container has attribute `checksum `:
      we compute checksum for both rendered the to-be-rendered HTML,
      destroy-and-recreate if there's difference in the checksums
    Otherwise:
      we assume there are no errors in the pre-rendered HTML
  */

  let el = document.createElement('div')

  el.innerHTML = '<div><span id="1"></span><span id="2"></span></div>'
  let render = createDOMRenderer(el)
  render(<div><span id="2"></span></div>)
  t.equal(
    el.innerHTML,
    '<div><span id="1"></span><span id="2"></span></div>',
    'no comparison of checksums occurs (nothing should happen)'
  )

  el.attributes.checksum = ' '
  el.innerHTML = '<div><span>Meow</span></div>'
  render = createDOMRenderer(el)
  render(<div><span>Thrr</span></div>)
  t.equal(
    el.innerHTML,
    '<div><span>Thrr</span></div>',
    'destory and re-rendered due to checksums difference'
  )

  el.innerHTML = '<div><span>Cat</span></div>'
  render(<div><span>Neko</span></div>)
  t.equal(
    el.innerHTML,
    '<div><span>Cat</span></div>',
    'nothing should happen because this is not the first call to render'
  )

  t.end()
})
