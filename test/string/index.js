/** @jsx dom */

import {deku,renderString} from '../../'
import dom from 'virtual-element'
import test from 'tape'

var render = function (vnode) {
  var app = deku()
  app.mount(vnode)
  return renderString(app)
}

test('rendering virtual element to a string', ({equal,end}) => {
  var Other = {
    render: function(props) {
      return <span>{props.text}</span>
    }
  }
  var Component = {
    render: function (component) {
      return (
        <div id="foo">
          <span>foo</span>
          <Other text="foo" />
        </div>
      )
    }
  }
  equal(render(<Component />), '<div id="foo"><span>foo</span><span>foo</span></div>', 'element rendered')
  end()
})

test('rendering components with children', ({equal,notEqual,end}) => {
  var Component = {
    render: function (props) {
      return <div>{props.children}</div>;
    }
  }
  notEqual(render(<Component />), '<div>undefined</div>');
  equal(render(<Component>test</Component>), '<div>test</div>');
  end()
})

test('renderString: components', ({equal,end}) => {
  var Component = {
    defaultProps: {
      hello: 'Hello'
    },
    render: function (props) {
      return <div>{props.hello} {props.name}</div>
    }
  }
  equal(render(<Component name="Amanda" />), '<div>Hello Amanda</div>', 'rendered correctly')
  end()
})

test('renderString: innerHTML', assert => {
  var app = deku()
  app.mount(<div innerHTML="<span>foo</span>" />)
  assert.equal(renderString(app), '<div><span>foo</span></div>', 'innerHTML rendered')
  assert.end()
})

test('renderString: input.value', assert => {
  var app = deku()
  app.mount(<input value="foo" />)
  assert.equal(renderString(app), '<input value="foo"></input>', 'value rendered')
  assert.end()
})

test('renderString: function attributes', assert => {
  function foo() { return 'blah' }
  var app = deku(<div onClick={foo} />)
  assert.equal(renderString(app), '<div></div>', 'attribute not rendered')
  assert.end()
})

test('renderString: empty attributes', assert => {
  var app = deku(<input type="checkbox" value="" />)
  assert.equal(renderString(app), '<input type="checkbox" value=""></input>', 'empty string attribute not rendered')

  var app = deku(<input type="checkbox" value={0} />)
  assert.equal(renderString(app), '<input type="checkbox" value="0"></input>', 'zero attribute not rendered')

  var app = deku(<input type="checkbox" disabled={false} />)
  assert.equal(renderString(app), '<input type="checkbox"></input>', 'false attribute unexpectedly rendered')

  var app = deku(<input type="checkbox" disabled={null} />)
  assert.equal(renderString(app), '<input type="checkbox"></input>', 'null attribute unexpectedly rendered')

  var disabled;
  var app = deku(<input type="checkbox" disabled={disabled} />)
  assert.equal(renderString(app), '<input type="checkbox"></input>', 'undefined attribute unexpectedly rendered')

  assert.end()
})