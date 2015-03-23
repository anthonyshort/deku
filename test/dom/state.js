import assert from 'assert'
import {component,dom,scene} from '../../'
import {mount,Span} from '../helpers'

var StateChangeOnMount = component({
  initialState: function(){
    return { text: 'foo' };
  },
  afterMount: function(){
    this.setState({ text: 'bar' });
  },
  render: function(props, state){
    var Test = component(Span);
    return Test({ text: state.text });
  }
});

it('should update components when state changes', function(){
  var app = scene(StateChangeOnMount)
  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<span>foo</span>');
    renderer.render()
    assert.equal(el.innerHTML, '<span>bar</span>');
  })
});

it('should update composed components when state changes', function(){
  var Composed = component({
    afterUpdate: function(){
      throw new Error('Parent should not be updated');
    },
    render: function(props, state){
      return dom('div', null, [
        dom(StateChangeOnMount)
      ]);
    }
  });
  var app = scene(Composed)
  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div><span>foo</span></div>')
    renderer.render()
    assert.equal(el.innerHTML, '<div><span>bar</span></div>')
  })
});

it('should have initial state', function(){
  var DefaultState = component({
    initialState: function(){
      return {
        text: 'Hello World'
      };
    },
    render: function(props, state){
      return dom('span', null, state.text);
    }
  });
  var app = scene(DefaultState)
  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<span>Hello World</span>')
  })
});