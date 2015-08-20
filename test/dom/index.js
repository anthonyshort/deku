/** @jsx dom */

import trigger from 'trigger-event'
import Emitter from 'component-emitter'
import raf from 'component-raf'
import {deku,render} from '../../'
import dom from 'virtual-element'
import test from 'tape'

// Test Components

var RenderChildren  = props => props.children[0]
var ListItem        = props => <li>{props.children}</li>
var Wrapper         = props => <div>{props.children}</div>
var TwoWords        = props => <span>{props.one} {props.two}</span>

// Test helpers

var div = function(){
  var el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

var setup = function (equal) {
  var app = deku()
  var el = div()
  var renderer = render(app, el, { batching: false })
  var $ = el.querySelector.bind(el)
  var mount = app.mount.bind(app)
  var unmount = app.unmount.bind(app)
  var html = createAssertHTML(el, equal)
  return {renderer, el, app, $, mount, unmount, html}
}

var teardown = function ({ renderer, el }) {
  renderer.remove()
  if (el.parentNode) el.parentNode.removeChild(el)
}

var createAssertHTML = function(container, equal) {
  var dummy = document.createElement('div')
  return function (html, message) {
    html = html.replace(/\n(\s+)?/g,'').replace(/\s+/g,' ')
    equal(html, container.innerHTML, message || 'innerHTML is equal')
  }
}

// Tests

test('rendering DOM', ({equal,end,notEqual,pass,fail}) => {
  var {renderer,el,mount,unmount,html} = setup(equal)
  var rootEl

  // Render
  mount(<span />)
  html('<span></span>', 'no attribute')

  // Add
  mount(<span name="Bob" />)
  html('<span name="Bob"></span>', 'attribute added')

  // Update
  mount(<span name="Tom" />)
  html('<span name="Tom"></span>', 'attribute updated')

  // Update
  mount(<span name={null} />)
  html('<span></span>', 'attribute removed with null')

  // Update
  mount(<span name={undefined} />)
  html('<span></span>', 'attribute removed with undefined')

  // Update
  mount(<span name="Bob" />)
  el.children[0].setAttribute = () => fail('DOM was touched')

  // Update
  mount(<span name="Bob" />)
  pass('DOM not updated without change')

  // Update
  mount(<span>Hello World</span>)
  html(`<span>Hello World</span>`, 'text rendered')

  rootEl = el.firstChild

  // Update
  mount(<span>Hello Pluto</span>)
  html('<span>Hello Pluto</span>', 'text updated')

  // Remove
  mount(<span></span>)
  html('<span></span>', 'text removed')

  // Update
  mount(<span>{undefined} World</span>)
  html('<span> World</span>', 'text was replaced by undefined')

  // Root element should still be the same
  equal(el.firstChild, rootEl, 'root element not replaced')

  // Replace
  mount(<div>Foo!</div>)
  html('<div>Foo!</div>', 'element is replaced')
  notEqual(el.firstChild, rootEl, 'root element replaced')

  // Clear
  unmount()
  html('', 'element is removed when unmounted')

  // Render
  mount(<div>Foo!</div>)
  html('<div>Foo!</div>', 'element is rendered again')

  rootEl = el.firstChild

  // Update
  mount(<div><span/></div>)
  html('<div><span></span></div>', 'replaced text with an element')

  // Update
  mount(<div>bar</div>)
  html('<div>bar</div>', 'replaced child with text')

  // Update
  mount(<div><span>Hello World</span></div>)
  html('<div><span>Hello World</span></div>', 'replaced text with element')

  // Remove
  mount(<div></div>)
  html('<div></div>', 'removed element')
  equal(el.firstChild, rootEl, 'root element not replaced')

  // Children added
  mount(
    <div>
      <span>one</span>
      <span>two</span>
      <span>three</span>
    </div>
  )
  html(`
    <div>
      <span>one</span>
      <span>two</span>
      <span>three</span>
    </div>`
  )
  equal(el.firstChild, rootEl, 'root element not replaced')
  var span = el.firstChild.firstChild

  // Siblings removed
  mount(
    <div>
      <span>one</span>
    </div>
  )
  html('<div><span>one</span></div>', 'added element')
  equal(el.firstChild.firstChild, span, 'child element not replaced')
  equal(el.firstChild, rootEl, 'root element not replaced')

  // Removing the renderer
  teardown({ renderer, el })
  html('', 'element is removed')
  end()
})

test('falsy attributes should not touch the DOM', ({equal,end,pass,fail}) => {
  var {renderer,el,mount} = setup(equal)
  mount(<span name="" />)
  var child = el.children[0]
  child.setAttribute = () => fail('should not set attributes')
  child.removeAttribute = () => fail('should not remove attributes')
  mount(<span name="" />)
  pass('DOM not touched')
  teardown({ renderer, el })
  end()
})

test('innerHTML attribute', ({equal,end}) => {
  var {html,mount,el,renderer} = setup(equal)
  mount(<div innerHTML="Hello <strong>deku</strong>" />)
  html('<div>Hello <strong>deku</strong></div>', 'innerHTML is rendered')
  mount(<div innerHTML="Hello <strong>Pluto</strong>" />)
  html('<div>Hello <strong>Pluto</strong></div>', 'innerHTML is updated')
  mount(<div />)
  // Causing issues in IE10. Renders with a &nbsp; for some reason
  // html('<div></div>', 'innerHTML is removed')
  teardown({renderer,el})
  end()
})

test('input attributes', ({equal,notEqual,end,ok,test,comment}) => {
  var {html,mount,el,renderer,$} = setup(equal)
  mount(<input />)
  var checkbox = $('input')

  comment('input.value')
  mount(<input value="Bob" />)
  equal(checkbox.value, 'Bob', 'value property set')
  mount(<input value="Tom" />)
  equal(checkbox.value, 'Tom', 'value property updated')
  mount(<input />)
  equal(checkbox.value, '', 'value property removed')

  comment('input cursor position')
  mount(<input type="text" value="Game of Thrones" />)
  var input = $('input')
  input.focus()
  input.setSelectionRange(5,7)
  mount(<input type="text" value="Way of Kings" />)
  equal(input.selectionStart, 5, 'selection start')
  equal(input.selectionEnd, 7, 'selection end')

  comment('input cursor position on inputs that don\'t support text selection')
  mount(<input type="email" value="a@b.com" />)

  comment('input cursor position only the active element')
  mount(<input type="text" value="Hello World" />)
  var input = $('input')
  input.setSelectionRange(5,7)
  if (input.setActive) document.body.setActive()
  else input.blur()
  mount(<input type="text" value="Hello World!" />)
  notEqual(input.selectionStart, 5, 'selection start')
  notEqual(input.selectionEnd, 7, 'selection end')

  comment('input.checked')
  mount(<input checked={true} />)
  ok(checkbox.checked, 'checked with a true value')
  equal(checkbox.getAttribute('checked'), null, 'has checked attribute')
  mount(<input checked={false} />)
  ok(!checkbox.checked, 'unchecked with a false value')
  ok(!checkbox.hasAttribute('checked'), 'has no checked attribute')
  mount(<input checked />)
  ok(checkbox.checked, 'checked with a boolean attribute')
  equal(checkbox.getAttribute('checked'), null, 'has checked attribute')
  mount(<input />)
  ok(!checkbox.checked, 'unchecked when attribute is removed')
  ok(!checkbox.hasAttribute('checked'), 'has no checked attribute')

  comment('input.disabled')
  mount(<input disabled={true} />)
  ok(checkbox.disabled, 'disabled with a true value')
  equal(checkbox.hasAttribute('disabled'), true, 'has disabled attribute')
  mount(<input disabled={false} />)
  equal(checkbox.disabled, false, 'disabled is false with false value')
  equal(checkbox.hasAttribute('disabled'), false, 'has no disabled attribute')
  mount(<input disabled />)
  ok(checkbox.disabled, 'disabled is true with a boolean attribute')
  equal(checkbox.hasAttribute('disabled'), true, 'has disabled attribute')
  mount(<input />)
  equal(checkbox.disabled, false, 'disabled is false when attribute is removed')
  equal(checkbox.hasAttribute('disabled'), false, 'has no disabled attribute')

  teardown({renderer,el})
  end()
})

test('option[selected]', ({ok,end,equal}) => {
  var {mount,renderer,el} = setup(equal)
  var options

  // first should be selected
  mount(
    <select>
      <option selected>one</option>
      <option>two</option>
    </select>
  )

  options = el.querySelectorAll('option')
  ok(!options[1].selected, 'is not selected')
  ok(options[0].selected, 'is selected')

  // second should be selected
  mount(
    <select>
      <option>one</option>
      <option selected>two</option>
    </select>
  )

  options = el.querySelectorAll('option')
  ok(!options[0].selected, 'is not selected')
  ok(options[1].selected, 'is selected')

  teardown({renderer,el})
  end()
})

test('components', ({equal,end}) => {
  var {el,renderer,mount,html} = setup(equal)

  // Object Component
  var Test = {
    defaultProps: { name: 'Amanda' },
    initialState: (props) => ({ text: 'Hello World' }),
    render: (props) => <span count={props.count} name={props.name}>Hello World</span>,
  }

  mount(<Test count={2} />)
  var root = el.firstElementChild
  equal(root.getAttribute('count'), '2', 'rendered with props')
  equal(root.getAttribute('name'), 'Amanda', 'has default props')

  mount(<Test count={3} />)
  equal(root.getAttribute('count'), '3', 'props updated')
  equal(root.getAttribute('name'), 'Amanda', 'default props still exist')

  teardown({renderer,el})
  equal(el.innerHTML, '', 'the element is removed')
  end()
})

test('simple components', ({equal,end}) => {
  var {el,renderer,mount,html} = setup(equal)
  var Box = (props) => <div>{props.text}</div>
  mount(<Box text="Hello World" />)
  html('<div>Hello World</div>', 'function component rendered')
  teardown({renderer,el})
  end()
})

test('nested component lifecycle hooks fire in the correct order', ({deepEqual,mount,end,equal}) => {
  var {el,renderer,mount} = setup(equal)
  var log = []

  var LifecycleLogger = {
    validate (props) {
      log.push(props.name + ' validate')
    },
    render (props) {
      log.push(props.name + ' render')
      return <div>{props.children}</div>
    },
    afterRender (props) {
      log.push(props.name + ' afterRender')
    },
    afterMount (props) {
      log.push(props.name + ' afterMount')
    },
    beforeUnmount (props, el) {
      log.push(props.name + ' beforeUnmount')
    }
  }

  mount(
    <Wrapper>
      <LifecycleLogger name="GrandParent">
        <LifecycleLogger name="Parent">
          <LifecycleLogger name="Child" />
        </LifecycleLogger>
      </LifecycleLogger>
    </Wrapper>
  )

  deepEqual(log, [
    'GrandParent validate',
    'GrandParent render',
    'Parent validate',
    'Parent render',
    'Child validate',
    'Child render',
    'Child afterRender',
    'Child afterMount',
    'Parent afterRender',
    'Parent afterMount',
    'GrandParent afterRender',
    'GrandParent afterMount'
  ], 'initial render')
  log = []

  mount(
    <Wrapper>
      <LifecycleLogger name="GrandParent">
        <LifecycleLogger name="Parent">
          <LifecycleLogger name="Child" />
        </LifecycleLogger>
      </LifecycleLogger>
    </Wrapper>
  )

  deepEqual(log, [
    'GrandParent validate',
    'GrandParent render',
    'Parent validate',
    'Parent render',
    'Child validate',
    'Child render',
    'Child afterRender',
    'Parent afterRender',
    'GrandParent afterRender'
  ], 'updated')
  log = []

  mount(<Wrapper></Wrapper>)

  deepEqual(log, [
    'GrandParent beforeUnmount',
    'Parent beforeUnmount',
    'Child beforeUnmount'
  ], 'unmounted with app.unmount()')

  mount(
    <Wrapper>
      <LifecycleLogger name="GrandParent">
        <LifecycleLogger name="Parent">
          <LifecycleLogger name="Child" />
        </LifecycleLogger>
      </LifecycleLogger>
    </Wrapper>
  )
  log = []

  teardown({renderer,el})

  deepEqual(log, [
    'GrandParent beforeUnmount',
    'Parent beforeUnmount',
    'Child beforeUnmount'
  ], 'unmounted with renderer.remove()')

  end()
})

test('component lifecycle hook signatures', ({ok,end,equal}) => {
  var {mount,renderer,el} = setup(equal)

  var MyComponent = {
    defaultProps: {
      count: 0
    },
    validate (props) {
      ok(props, 'validate has props')
    },
    render (props) {
      ok(props, 'render has props')
      return <div id="foo" />
    },
    afterRender (props, el) {
      ok(props, 'afterRender has props')
      ok(el, 'afterRender has DOM element')
    },
    afterMount (props, el) {
      ok(props, 'afterMount has props')
      ok(el, 'afterMount has DOM element')
      ok(document.getElementById('foo'), 'element is in the DOM')
    },
    beforeUnmount (props, el) {
      ok(props, 'beforeUnmount has props')
      ok(el, 'beforeUnmount has el')
      end()
    }
  }

  mount(<MyComponent />)
  teardown({renderer,el})
})

test('replace props instead of merging', ({equal,end}) => {
  var {mount,renderer,el} = setup(equal)
  mount(<TwoWords one="Hello" two="World" />)
  mount(<TwoWords two="Pluto" />)
  equal(el.innerHTML, '<span> Pluto</span>')
  teardown({renderer,el})
  end()
})

test(`should update all children when a parent component changes`, ({equal,end}) => {
  var {mount,renderer,el} = setup(equal)
  var parentCalls = 0
  var childCalls = 0

  var Child = {
    render: function(props){
      childCalls++
      return <span>{props.text}</span>
    }
  }

  var Parent = {
    render: function(props){
      parentCalls++
      return (
        <div name={props.character}>
          <Child text="foo" />
        </div>
      )
    }
  }

  mount(<Parent character="Link" />)
  mount(<Parent character="Zelda" />)
  equal(childCalls, 2, 'child rendered twice')
  equal(parentCalls, 2, 'parent rendered twice')
  teardown({renderer,el})
  end()
})

test.skip('batched rendering', assert => {
  var i = 0
  var IncrementAfterUpdate = {
    render: function(){
      return <div></div>
    },
    afterUpdate: function(){
      i++
    }
  }
  var el = document.createElement('div')
  var app = deku()
  app.mount(<IncrementAfterUpdate text="one" />)
  var renderer = render(app, el)
  app.mount(<IncrementAfterUpdate text="two" />)
  app.mount(<IncrementAfterUpdate text="three" />)
  raf(function(){
    assert.equal(i, 1, 'rendered *once* on the next frame')
    renderer.remove()
    assert.end()
  })
})

test('rendering nested components', ({equal,end}) => {
  var {mount,renderer,el,html} = setup(equal)

  var ComponentA = (props) => <div name="ComponentA">{props.children}</div>
  var ComponentB = (props) => <div name="ComponentB">{props.children}</div>

  var ComponentC = (props) => {
    return (
      <div name="ComponentC">
        <ComponentB>
          <ComponentA>
            <span>{props.text}</span>
          </ComponentA>
        </ComponentB>
      </div>
    )
  }

  mount(<ComponentC text='Hello World!' />)
  html('<div name="ComponentC"><div name="ComponentB"><div name="ComponentA"><span>Hello World!</span></div></div></div>', 'element is rendered')
  mount(<ComponentC text='Hello Pluto!' />)
  equal(el.innerHTML, '<div name="ComponentC"><div name="ComponentB"><div name="ComponentA"><span>Hello Pluto!</span></div></div></div>', 'element is updated with props')
  teardown({renderer,el})
  html('', 'element is removed')
  end()
})

test('skipping updates when the same virtual element is returned', ({equal,end,fail,pass}) => {
  var {mount,renderer,el} = setup(equal)
  var el = <div/>
  var i = 0

  var Component = {
    render (component) {
      i++
      return el
    },
    afterRender () {
      if (i === 2) fail('component was updated')
    }
  }

  mount(<Component count={0} />)
  mount(<Component count={1} />)
  pass('component not updated')
  teardown({renderer,el})
  end()
})

test('should empty the container before initial render', assert => {
  var el = div()
  el.innerHTML = '<div>a</div>'
  var app = deku(<div>b</div>)
  var renderer = render(app, el)
  assert.equal(el.innerHTML, '<div>b</div>', 'container was emptied')
  renderer.remove()
  assert.end()
})

test('unmount sub-components that move themselves in the DOM', ({equal,end}) => {
  var {mount,renderer,el} = setup(equal)
  var arr = []

  var Overlay = {
    afterMount: (component, el) => {
      document.body.appendChild(el)
    },
    beforeUnmount: function(){
      arr.push('A')
    },
    render: function(){
      return <div class='Overlay' />
    }
  }

  var Parent = {
    render: (props) => {
      if (props.show) {
        return (
          <div>
            <Overlay />
          </div>
        )
      } else {
        return <div />
      }
    }
  }

  mount(<Parent show={true} />)
  var overlay = document.querySelector('.Overlay')
  equal(overlay.parentElement, document.body, 'element was moved in the DOM')
  mount(<Parent show={false} />)
  equal(arr[0], 'A', 'unmount was called')
  teardown({renderer,el})
  end()
})

test('firing mount events on sub-components created later', ({equal,pass,end,plan}) => {
  var {mount,renderer,el} = setup(equal)

  var ComponentA = {
    render: () => <div />,
    beforeUnmount: () => pass('beforeUnmount called'),
    afterMount: () => pass('afterMount called')
  }

  plan(2)
  mount(<ComponentA />)
  mount(<div />)
  teardown({renderer,el})
  end()
})

test('should change root node and still update correctly', ({equal,end}) => {
  var {mount,html,renderer,el} = setup(equal)

  var ComponentA  = (props) => dom(props.type, null, props.text)
  var Test        = (props) => <ComponentA type={props.type} text={props.text} />

  mount(<Test type="span" text="test" />)
  html('<span>test</span>')
  mount(<Test type="div" text="test" />)
  html('<div>test</div>')
  mount(<Test type="div" text="foo" />)
  html('<div>foo</div>')
  teardown({renderer,el})
  end()
})

test('replacing components with other components', ({equal,end}) => {
  var {mount,renderer,el,html} = setup(equal)
  var ComponentA = () => <div>A</div>
  var ComponentB = () => <div>B</div>

  var ComponentC = (props) => {
    if (props.type === 'A') {
      return <ComponentA />
    } else {
      return <ComponentB />
    }
  }

  mount(<ComponentC type="A" />)
  html('<div>A</div>')
  mount(<ComponentC type="B" />)
  html('<div>B</div>')
  teardown({renderer,el})
  end()
})

test('adding, removing and updating events', ({equal,end}) => {
  var {mount,renderer,el,$} = setup(equal)
  var count = 0
  var onclicka = () => count += 1
  var onclickb = () => count -= 1

  var Page = {
    render: (props) => <span onClick={props.clicker} />
  }

  mount(<Page clicker={onclicka} />)
  trigger($('span'), 'click')
  equal(count, 1, 'event added')
  mount(<Page clicker={onclickb} />)
  trigger($('span'), 'click')
  equal(count, 0, 'event updated')
  mount(<Page />)
  trigger($('span'), 'click')
  equal(count, 0, 'event removed')
  teardown({renderer,el})
  end()
})

test('should bubble events', ({equal,end,fail,ok}) => {
  var {mount,renderer,el,$} = setup(equal)
  var state = {}

  var Test = {
    render: function (props) {
      let state = props.state
      return (
        <div onClick={onParentClick}>
          <div class={state.active ? 'active' : ''} onClick={onClickTest}>
            <a>link</a>
          </div>
        </div>
      )
    }
  }

  var onClickTest = function (event) {
    state.active = true
    equal(el.firstChild.firstChild.firstChild, event.target, 'event.target is set')
    event.stopImmediatePropagation()
  }

  var onParentClick = function () {
    fail('event bubbling was not stopped')
  }

  mount(<Test state={state} />)
  trigger($('a'), 'click')
  equal(state.active, true, 'state was changed')
  mount(<Test state={state} />)
  ok($('.active'), 'event fired on parent element')
  teardown({renderer,el})
  end()
})

test('unmounting components when removing an element', ({equal,pass,end,plan}) => {
  var {mount,renderer,el} = setup(equal)

  var Test = {
    render:        () => <div />,
    beforeUnmount: () => pass('component was unmounted')
  }

  plan(1)
  mount(<div><div><Test /></div></div>)
  mount(<div></div>)
  teardown({renderer,el})
  end()
})

test('update sub-components with the same element', ({equal,end}) => {
  var {mount,renderer,el} = setup(equal)

  let Page1 = {
    render(props) {
      return (
        <Wrapper>
          <Wrapper>
            <Wrapper>
              {
                props.show ?
                  <div>
                    <label/>
                    <input/>
                  </div>
                :
                  <span>
                    Hello
                  </span>
              }
            </Wrapper>
          </Wrapper>
        </Wrapper>
      )
    }
  }

  let Page2 = (props) => {
    return (
      <div>
        <span>{props.title}</span>
      </div>
    )
  }

  let App = (props) => props.page === 1 ? <Page1 show={props.show} /> : <Page2 title={props.title} />

  mount(<App page={1} show={true} />)
  mount(<App page={1} show={false} />)
  mount(<App page={2} title="Hello World" />)
  mount(<App page={2} title="foo" />)
  equal(el.innerHTML, '<div><span>foo</span></div>')
  teardown({renderer,el})
  end()
})

test('replace elements with component nodes', ({equal,end}) => {
  var {mount,renderer,el} = setup(equal)
  mount(<span/>)
  equal(el.innerHTML, '<span></span>', 'rendered element')
  mount(<Wrapper>component</Wrapper>)
  equal(el.innerHTML, '<div>component</div>', 'replaced with component')
  teardown({renderer,el})
  end()
})

test('svg elements', ({equal,end}) => {
  var {mount,renderer,el} = setup(equal)
  mount(
    <svg width="92px" height="92px" viewBox="0 0 92 92">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <circle id="circle" fill="#D8D8D8" cx="46" cy="46" r="46"></circle>
      </g>
    </svg>
  )
  equal(el.firstChild.tagName, 'svg', 'rendered svg element')
  teardown({renderer,el})
  end()
})

test('moving components with keys', ({equal,end,ok,pass,plan}) => {
  var {mount,renderer,el} = setup(equal)
  var one,two,three

  plan(10)

  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="bar">Two</ListItem>
    </ul>
  )
  var [one,two] = el.querySelectorAll('li')

  // Moving
  mount(
    <ul>
      <ListItem key="bar">Two</ListItem>
      <ListItem key="foo">One</ListItem>
    </ul>
  )
  var updated = el.querySelectorAll('li')
  ok(updated[1] === one, 'foo moved down')
  ok(updated[0] === two, 'bar moved up')

  // Removing
  mount(
    <ul>
      <ListItem key="bar">Two</ListItem>
    </ul>
  )
  updated = el.querySelectorAll('li')
  ok(updated[0] === two && updated.length === 1, 'foo was removed')

  // Updating
  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="bar">Two</ListItem>
      <ListItem key="baz">Three</ListItem>
    </ul>
  )
  var [one,two,three] = el.querySelectorAll('li')
  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="baz">Four</ListItem>
    </ul>
  )
  var updated = el.querySelectorAll('li')
  ok(updated[0] === one, 'foo is the same')
  ok(updated[1] === three, 'baz is the same')
  ok(updated[1].innerHTML === 'Four', 'baz was updated')
  var foo = updated[0]
  var baz = updated[1]

  // Adding
  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="bar">Five</ListItem>
      <ListItem key="baz">Four</ListItem>
    </ul>
  )
  var updated = el.querySelectorAll('li')
  ok(updated[0] === foo, 'foo is the same')
  ok(updated[2] === baz, 'baz is the same')
  ok(updated[1].innerHTML === 'Five', 'bar was added')

  // Moving event handlers
  var clicked = () => pass('event handler moved')
  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="bar">
        <span onClick={clicked}>Click Me!</span>
      </ListItem>
    </ul>
  )
  mount(
    <ul>
      <ListItem key="bar">
        <span onClick={clicked}>Click Me!</span>
      </ListItem>
      <ListItem key="foo">One</ListItem>
    </ul>
  )
  trigger(el.querySelector('span'), 'click')

  // Removing handlers. If the handler isn't removed from
  // the path correctly, it will still fire the handler from
  // the previous assertion.
  mount(
    <ul>
      <ListItem key="foo">
        <span>One</span>
      </ListItem>
    </ul>
  )
  trigger(el.querySelector('span'), 'click')

  teardown({renderer,el})
  end()
})

test('updating event handlers when children are removed', ({equal,end}) => {
  var {mount,renderer,el} = setup(equal)
  var items = ['foo','bar','baz']

  var ListItem = (props) => {
    return (
      <li>
        <a onClick={e => items.splice(props.index, 1)} />
      </li>
    )
  }

  var List = (props) => {
    return (
      <ul>
        {props.items.map((_,i) => <ListItem index={i} />)}
      </ul>
    )
  }

  mount(<List items={items} />)
  trigger(el.querySelector('a'), 'click')
  mount(<List items={items} />)
  trigger(el.querySelector('a'), 'click')
  mount(<List items={items} />)
  trigger(el.querySelector('a'), 'click')
  mount(<List items={items} />)
  equal(el.innerHTML, '<ul></ul>', 'all items were removed')

  teardown({renderer,el})
  end()
})

// Let's run this test only if the browser supports shadow DOM
if (document.body.createShadowRoot) {
  test('change the root listener node so we can render into document fragments', ({equal,end}) => {
    var Button = {
      render: props => {
        return dom('button', { onClick: () => end() })
      }
    }

    var host = document.createElement('div')
    var shadow = host.createShadowRoot()
    shadow.innerHTML = '<div></div>'
    var mountNode = shadow.querySelector('div')

    document.body.appendChild(host)

    var app = deku(<Button />)
    var renderer = render(app, mountNode, { batching: false })
    var button = shadow.querySelector('button')
    trigger(button, 'click')

    renderer.remove()
    document.body.removeChild(host)
  })
}