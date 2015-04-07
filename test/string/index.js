import assert from 'assert'
import {component,dom,renderString} from '../../'

it('should render an element', function(){
  var Component = component({
    render: function(props, state){
      return dom('div');
    }
  });
  assert.equal(renderString(Component), '<div></div>')
});

it('should render an element with attributes', function(){
  var Component = component({
    render: function(props, state){
      return dom('div', { id: 'foo'});
    }
  });
  assert.equal(renderString(Component), '<div id="foo"></div>')
});

it('should render an element with text', function(){
  var Component = component({
    render: function(props, state){
      return dom('div', null, 'foo');
    }
  });
  assert.equal(renderString(Component), '<div>foo</div>')
});

it('should render an element with child elements', function(){
  var Component = component({
    render: function(props, state){
      return dom('div', null, [
        dom('span', null, 'foo')
      ]);
    }
  });
  assert.equal(renderString(Component), '<div><span>foo</span></div>')
});

it('should render an element with child components', function(){
  var Span = component({
    render: function(props, state){
      return dom('span', null, 'foo');
    }
  });
  var Div = component({
    render: function(props, state){
      return dom('div', null, [
        dom(Span)
      ]);
    }
  });
  assert.equal(renderString(Div), '<div><span>foo</span></div>')
});

it('should render an element with component root', function(){
  var Span = component({
    render: function(props, state){
      return dom('span', null, 'foo');
    }
  });
  var Component = component({
    render: function(props, state){
      return dom(Span);
    }
  });
  assert.equal(renderString(Component), '<span>foo</span>')
});

it('should render with props', function(){
  var Component = component({
    render: function(props, state){
      return dom('div', null, [props.text]);
    }
  });
  assert.equal(renderString(Component, { text: 'foo' }), '<div>foo</div>')
});

it('should render with initial state', function(){
  var Component = component({
    initialState: function(){
      return { text: 'foo' }
    },
    render: function(props, state){
      return dom('div', null, [state.text]);
    }
  });
  assert.equal(renderString(Component), '<div>foo</div>')
});

// TODO: it used to only call `beforeMount` on root node, no child nodes.
// wondering if that would work on them.
it.skip('should call beforeMount', function(done){
  var Component = component({
    initialState: function(){
      return { text: 'foo' }
    },
    beforeMount: function(props, state){
      assert(props.foo)
      assert(state.text)
      done()
    },
    render: function(props, state){
      return dom('div');
    }
  });
  var app = world(Component).setProps({ foo: 'bar' })
  renderString(Component)
})

it('should render innerHTML', function(){
  var Component = component({
    render: function(props, state){
      return dom('div', { innerHTML: '<span>foo</span>' });
    }
  });
  assert.equal(renderString(Component), '<div><span>foo</span></div>')
})

it('should render the value of inputs', function(){
  var Component = component({
    render: function(props, state){
      return dom('input', { value: 'foo' });
    }
  });
  assert.equal(renderString(Component), '<input value="foo"></input>')
})
