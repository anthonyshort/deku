import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,Span,div} from '../helpers'

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

it('should update components when state changes', function(done){
  var app = deku();
  var el = div();
  app.mount(el, StateChangeOnMount);
  assert.equal(el.innerHTML, '<span>foo</span>');
  requestAnimationFrame(function(){
    assert.equal(el.innerHTML, '<span>bar</span>');
    done();
  });
});

it('should update composed components when state changes', function(done){
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
  var app = deku();
  var el = div();
  app.mount(el, Composed)

  assert.equal(el.innerHTML, '<div><span>foo</span></div>')
  requestAnimationFrame(function(){
    assert.equal(el.innerHTML, '<div><span>bar</span></div>');
    done();
  });
});
