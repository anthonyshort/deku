/* eslint-disable react/prop-types */
/** @jsx h */
import test from 'tape'
import {createApp} from '../../src/app'
import {create as h} from '../../src/element'
import {str as adler32} from 'adler-32'
import trigger from 'trigger-event'

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
  let el = document.createElement('div')
  document.body.appendChild(el);

  el.innerHTML = '<div id="_id0"><span id="_id0.0">Meow</span></div>'
  let render = createApp(el)
  render(<div><span>Thrr</span></div>)
  t.equal(
    el.innerHTML,
    '<div id="_id0"><span id="_id0.0">Thrr</span></div>',
    'inequivalent string updated'
  )

  el.innerHTML = '<div id="_id0">Nyan!</div>'
  render = createApp(el)
  render(<p>Nyan!</p>)
  t.equal(
    el.innerHTML,
    '<p>Nyan!</p>',
    're-rendered due to changed tagName'
  )
  
  document.body.removeChild(el);
  t.end()
})

test('rerendering custom element with changing props', t => {
  let el = document.createElement('div')
  document.body.appendChild(el);
  const Comp = {
    render({props, path}) {
      return (
        <span data-id={props.dataid}>woot</span>
      );
    }
  }

  let render = createApp(el);

  el.innerHTML = '<div id="_id0"><span id="_id0.0" data-id="100">woot</span></div>';
  el.children[0].attributes.chck = 1;
  el.children[0].children[0].attributes.chck = 2;

  render(<div><Comp dataid="200" /></div>);

  t.equal(
    el.children[0].attributes.chck,
    1,
    'should not rerender outer div'
  )
  t.equal(
    el.children[0].children[0].attributes.chck,
    2,
    'should not rerender inner span'
  )
  t.equal(
    el.innerHTML,
    '<div id="_id0"><span id="_id0.0" data-id="200">woot</span></div>',
    'attributes should be updated when needed'
  )

  document.body.removeChild(el);
  t.end();
});

test('rendering in a container with pre-rendered HTML and click events', t => {
  t.plan(12)
  let el = document.createElement('div')
  el.innerHTML = '<div><button></button><span></span><button></button><div><div><span></span></div></div></div>'
  let render = createApp(el)
  let a = function(){t.assert("clicked")}
  let b = function(){t.assert("clicked"); t.assert("clicked")}
  render(<div><button onClick={a}/><span onClick={b}/><button onClick={a}/><div><div><span onClick={b}/></div></div></div>)
  let arr = el.querySelectorAll('button, span')
  for (var item of arr) {
    trigger(item, 'click')
    trigger(item, 'click')
  }
  t.end()
})
