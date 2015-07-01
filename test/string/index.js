/** @jsx dom */

import assert from 'assert'
import {dom,renderString} from '../../'

it('should render an element', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <div></div>
    }
  };

  var app = (<Component />)
  assert.equal(renderString(app), '<div></div>')
});

it('should render an element with attributes', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return dom('div', { id: 'foo'});
    }
  };

  var app = (<Component />)
  assert.equal(renderString(app), '<div id="foo"></div>')
});

it('should render an element with text', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <div>foo</div>
    }
  }

  var app = (<Component />)
  assert.equal(renderString(app), '<div>foo</div>')
});

it('should render an element with child elements', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <div><span>foo</span></div>;
    }
  };

  var app = (<Component />)
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

  var app = (<Div />)
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

  var app = (<Component />)
  assert.equal(renderString(app), '<span>foo</span>')
});

it('should render with props', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <div>{props.text}</div>;
    }
  };

  var app = (<Component text="foo" />)
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

  var app = (<Component initialCount={0} />)
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

  var app = (<Component />)
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

  var app = (<Component foo="bar" />)
  renderString(app)
})

it('should render innerHTML', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return dom('div', { innerHTML: '<span>foo</span>' });
    }
  };

  var app = (<Component />)
  assert.equal(renderString(app), '<div><span>foo</span></div>')
})

it('should render the value of inputs', function(){
  var Component = {
    render: function(component){
      let {props, state} = component
      return <input value="foo" />
    }
  };

  var app = (<Component />)
  assert.equal(renderString(app), '<input value="foo"></input>')
})

it('should not render event handlers as attributes', function () {
  var Component = {
    render: function() {
      return <div onClick={foo} />
    }
  }
  function foo() { return 'blah' }
  var app = (<Component />)
  assert.equal(renderString(app), '<div></div>')
});

it('should render statics', function(){

  var Component = {
    dependencies: {
      text: 'text'
    },
    render: function({props}) {
      return <div>{props.text}</div>
    }
  }

  var App = {
    statics: {
      'text': 'Hello World'
    },
    render: function(component){
      return <Component/>
    }
  };

  var app = (<App/>)
  assert.equal(renderString(app), '<div>Hello World</div>')
});


it('should only render parent statics', function(){

  var C2 = {
    dependencies: {
      text: 'text'
    },
    render: function({props}) {
      return <div>{props.text}</div>
    }
  }

  var C1 = {
    statics: {
      'text': 'Goodbye World'
    },
    render: function(component){
      return <C2/>
    }
  };

  var App = {
    statics: {
      'text': 'Hello World'
    },
    render: function(component){
      return (
        <div>
          <C1/>
          <C2/>
        </div>
      )
    }
  };

  var app = (<App/>)
  assert.equal(renderString(app), '<div><div>Goodbye World</div><div>Hello World</div></div>')
});
