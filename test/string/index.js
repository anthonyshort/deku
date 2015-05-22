/** @jsx dom */

import assert from 'assert'
import {dom,deku,renderString} from '../../'

it('should render an element', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <div></div>
    }
  };
  var app = deku()
  app.mount(<Component />)
  assert.equal(renderString(app), '<div></div>')
});

it('should render an element with attributes', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return dom('div', { id: 'foo'});
    }
  };
  var app = deku()
  app.mount(<Component />)
  assert.equal(renderString(app), '<div id="foo"></div>')
});

it('should render an element with text', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <div>foo</div>
    }
  }
  var app = deku()
  app.mount(<Component />)
  assert.equal(renderString(app), '<div>foo</div>')
});

it('should render an element with child elements', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <div><span>foo</span></div>;
    }
  };
  var app = deku()
  app.mount(<Component />)
  assert.equal(renderString(app), '<div><span>foo</span></div>')
});

it('should render an element with child components', function(){
  var Span = {
    render: function(component){
      let {props, state} = component
      return <span>foo</span>;
    }
  };
  var Div = {
    render: function(component){
      let {props, state} = component
      return <div><Span /></div>;
    }
  };
  var app = deku()
  app.mount(<Div />)
  assert.equal(renderString(app), '<div><span>foo</span></div>')
});

it('should render an element with component root', function(){
  var Span = {
    render: function(component){
      let {props, state} = component
      return <span>foo</span>
    }
  };
  var Component = {
    render: function(component){
      let {props, state} = component
      return <Span />;
    }
  };
  var app = deku()
  app.mount(<Component />)
  assert.equal(renderString(app), '<span>foo</span>')
});

it('should render with props', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <div>{props.text}</div>;
    }
  };
  var app = deku()
  app.mount(<Component text="foo" />)
  assert.equal(renderString(app), '<div>foo</div>')
});

it('should render with initial state', function(){
  var Component = {
    initialState: function(props){
      return { text: 'foo', count: props.initialCount }
    },
    render: function(component){
      let {props, state} = component
      return <div count={state.count}>{state.text}</div>
    }
  };
  var app = deku()
  app.mount(<Component initialCount={0} />)
  assert.equal(renderString(app), '<div count="0">foo</div>')
});

it('should have initial props', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <div>{props.text}</div>
    },
    defaultProps: {
      text: 'Hello!'
    }
  }
  var app = deku()
  app.mount(<Component />)
  assert.equal(renderString(app), '<div>Hello!</div>')
})

it('should call beforeMount and beforeRender', function(done){
  var Component = {
    initialState: function(){
      return { text: 'foo' }
    },
    beforeMount: function(component){
      let {props, state} = component
      assert(props.foo)
      assert(state.text)
    },
    beforeRender: function(component){
      let {props, state} = component
      assert(props.foo)
      assert(state.text)
      done()
    },
    render: function(props, state){
      return dom('div');
    }
  };
  var app = deku()
  app.mount(<Component foo="bar" />)
  renderString(app)
})

it('should render innerHTML', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return dom('div', { innerHTML: '<span>foo</span>' });
    }
  };
  var app = deku()
  app.mount(<Component />)
  assert.equal(renderString(app), '<div><span>foo</span></div>')
})

it('should render the value of inputs', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <input value="foo" />
    }
  };
  var app = deku()
  app.mount(<Component />)
  assert.equal(renderString(app), '<input value="foo"></input>')
})

it('should render data sources', function(){
  var Component = {
    propTypes: {
      'text': { source: 'text' }
    },
    render: function(component){
      let {props, state} = component
      return <div>{props.text}</div>
    }
  };
  var app = deku()
    .set('text', 'Hello World')
    .mount(<Component />)
  assert.equal(renderString(app), '<div>Hello World</div>')
})
