import trigger from 'trigger-event'
import raf from 'component-raf'
import assert from 'assert'
import {component,dom,World} from '../../'
import {mount,div} from '../helpers'

var AttrComponent = component(function(props, state){
  var attrs = {};
  if (props.name) attrs.name = props.name;
  return dom('span', attrs);
});

it('should add/update/remove attributes', function(){
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, AttrComponent);
  assert.equal(el.innerHTML, '<span></span>')
  world.update({ name: 'Bob' })
  assert.equal(el.innerHTML, '<span name="Bob"></span>')
  world.update({ name: 'Tom' })
  assert.equal(el.innerHTML, '<span name="Tom"></span>')
  world.update({ name: null })
  assert.equal(el.innerHTML, '<span></span>')
})

it('should not touch the DOM if attributes have not changed', function(){
  var pass = true;
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, AttrComponent, {
    name: 'Bob'
  });
  el.setAttribute = function(){
    pass = false;
  };
  world.update({ name: 'Bob' })
  assert(pass)
})

it('should update the real value of input fields', function () {
  var Input = component({
    render: function(props, state){
      return dom('input', { value: props.value })
    }
  });

  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Input, {
    value: 'Bob'
  });

  assert.equal(el.querySelector('input').value, 'Bob');
  world.update({ value: 'Tom' });
  assert.equal(el.querySelector('input').value, 'Tom');
})

it('should render innerHTML', function () {
  var Test = component(function(){
    return dom('div', { innerHTML: 'Hello <strong>World</strong>' });
  });
  var app = world(Test)
  mount(app, function(el, renderer){
    assert.equal(el.innerHTML,'<div>Hello <strong>World</strong></div>')
  })
})

it('should update innerHTML', function () {
  var Test = component(function(props){
    return dom('div', { innerHTML: props.content });
  });

  var app = world(Test)
    .setProps({ content: 'Hello <strong>World</strong>' })

  mount(app, function(el, renderer){
    app.setProps({ content: 'Hello <strong>Pluto</strong>' });
    renderer.render();
    assert.equal(el.innerHTML,'<div>Hello <strong>Pluto</strong></div>');
  })
})
