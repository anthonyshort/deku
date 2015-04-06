import assert from 'assert'
import {component,dom,world} from '../../'
import {mount,Span} from '../helpers'

var StateChangeOnMount = component({
  initialState: function(){
    return { text: 'foo' };
  },
  afterMount: function(el, props, state, send){
    send({ text: 'bar' });
  },
  render: function(props, state){
    var Test = component(Span);
    return dom(Test, { text: state.text });
  }
});

it('should update components when state changes', function(){
  var app = world(StateChangeOnMount)
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
  var app = world(Composed)
  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div><span>foo</span></div>')
    renderer.render()
    assert.equal(el.innerHTML, '<div><span>bar</span></div>')
  })
});
