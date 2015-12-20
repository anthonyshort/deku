// test.skip('create element from thunk and call onCreate', t => {
//   t.plan(7)
//   let context = {}
//   let path = '0.5'
//
//   let Component = (model) => {
//     t.equal(model.context, context, 'render has context')
//     t.equal(model.attributes.name, 'foo', 'render has attributes')
//     t.equal(model.path, '0.5', 'render has path')
//     return <button>{model.children[0]}</button>
//   }
//
//   Component.onCreate = (model) => {
//     t.equal(model.path, '0.5')
//     t.equal(model.context, context)
//   }
//
//   let vnode = <Component name='foo'>Submit</Component>
//   let DOMElement = createElement(vnode, context, path)
//   t.equal(DOMElement.tagName, 'BUTTON', 'is correct tag')
//   t.equal(DOMElement.innerHTML, 'Submit', 'has text content')
//
//   t.end()
// })
//
//
// test('render (thunks)', t => {
//   let MyButton = m => <button>{m.attributes.text}</button>
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//   render(<div><MyButton text='Reset' key='foo' /></div>)
//   render(<div><MyButton text='Submit' key='foo' /></div>)
//   t.equal(el.innerHTML, '<div><button>Submit</button></div>', 'element update')
//   t.end()
// })
//
// test('render (thunk lifecycle hooks)', t => {
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//   var MyButton = m => <button>{m.attributes.text}</button>
//   MyButton.onCreate = (model, el) => t.pass('onCreate')
//   MyButton.onUpdate = (model, el) => t.pass('onUpdate')
//   // MyButton.onRemove = el => t.assert(el)
//   render(<MyButton text='hello' />)
//   render(<MyButton text='goodbye' />)
//   render(<div />)
//   t.end()
// })
//
// test('render (thunk context)', t => {
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//   let rootContext = { color: 'red' }
//   let Container = (m) => <div>{m.children}</div>
//   let MyButton = ({ context, attributes }) => {
//     t.equal(rootContext, context, 'rendered with context')
//     return <button>{attributes.text}</button>
//   }
//   t.plan(1)
//   render(<Container><MyButton text='hello' /></Container>, rootContext)
//   t.end()
// })
//
// test('higher-order thunks should have an element', t => {
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//   var Box = model => <div>{model.attributes.text}</div>
//   var Container = model => <Box text='hello' />
//   Container.onCreate = (model, el) => {
//     t.assert(el, 'element exists')
//   }
//   render(<Container />)
//   t.end()
// })
//
// test('memoizing the render function', t => {
//   let el = document.createElement('div')
//   let render = createDOMRenderer(el)
//   var i = 0
//   var vnode = <div onUpdate={el => i++} />
//   var Component = model => vnode
//   render(<Component />)
//   render(<Component />)
//   t.equal(i, 1, 'component not updated')
//   t.end()
// })

// test('diffNode (update thunk)', t => {
//   let {updateThunk} = actions
//   let MyButton = m => <button>{m.children}</button>
//
//   let actual = diffNode(
//     <MyButton color='red' key='foo' />,
//     <MyButton color='blue' key='foo' />
//   )
//
//   let expected = [
//     updateThunk(<MyButton color='blue' key='foo' />, <MyButton color='red' key='foo' />, '0', 0)
//   ]
//
//   t.deepEqual(actual, expected, 'update thunk')
//   t.end()
// })
