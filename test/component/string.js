import assert from 'assert'
import {component,dom,scene,renderString} from '../../'

it('should render an element', function () {
  var Component = component({
    render: function(props, state){
      return dom('div');
    }
  });
  var app = scene(Component)
  assert.equal(renderString(app),'<div></div>')
});

it('should render an element with attributes', function () {
  var Component = component({
    render: function(props, state){
      return dom('div', { id: 'foo'});
    }
  });
  var app = scene(Component)
  assert.equal(renderString(app),'<div id="foo"></div>')
});

it('should render an element with text', function () {
  var Component = component({
    render: function(props, state){
      return dom('div', null, 'foo');
    }
  });
  var app = scene(Component)
  assert.equal(renderString(app),'<div>foo</div>')
});

it('should render an element with child elements', function () {
  var Component = component({
    render: function(props, state){
      return dom('div', null, [
        dom('span', null, 'foo')
      ]);
    }
  });
  var app = scene(Component)
  assert.equal(renderString(app),'<div><span>foo</span></div>')
});

it('should render an element with child components', function () {
  var Span = component({
    render: function(props, state){
      return dom('span', null, 'foo');
    }
  });
  var Div = component({
    render: function(props, state){
      return dom('div', null, [
        Span()
      ]);
    }
  });
  var app = scene(Div)
  assert.equal(renderString(app),'<div><span>foo</span></div>')
});

it('should render an element with component root', function () {
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
  var app = scene(Component)
  assert.equal(renderString(app),'<span>foo</span>')
});

it('should render with props', function () {
  var Component = component({
    render: function(props, state){
      return dom('div', null, [props.text]);
    }
  });
  var app = scene(Component).setProps({ text: 'foo' })
  assert.equal(renderString(app),'<div>foo</div>')
});

it('should render with initial state', function () {
  var Component = component({
    initialState: function(){
      return { text: 'foo' }
    },
    render: function(props, state){
      return dom('div', null, [state.text]);
    }
  });
  var app = scene(Component)
  assert.equal(renderString(app),'<div>foo</div>')
});


it('should call beforeMount', function (done) {
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
  var app = scene(Component).setProps({ foo: 'bar' })
  renderString(app)
})