import trigger from 'trigger-event'
import raf from 'component-raf'
import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,div} from '../helpers'

var AttrComponent = component(function(props, state){
  return dom('span', props);
});

it('should add/update/remove attributes', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, AttrComponent);
  assert.equal(el.innerHTML, '<span></span>')
  app.update({ name: 'Bob' })
  assert.equal(el.innerHTML, '<span name="Bob"></span>')
  app.update({ name: 'Tom' })
  assert.equal(el.innerHTML, '<span name="Tom"></span>')
  app.update({ name: null })
  assert.equal(el.innerHTML, '<span></span>')
})

it('should not touch the DOM if attributes have not changed', function(){
  var app = deku().set('renderImmediate', true);
  var root = div();
  app.mount(root, AttrComponent, { name: 'Bob' });
  var el = root.children[0];
  el.setAttribute = function(){
    throw new Error('should not set attributes');
  };
  app.update({ name: 'Bob' })
})

it('should not touch the DOM just because attributes are falsy', function () {
  var app = deku().set('renderImmediate', true);
  var root = div();
  app.mount(root, AttrComponent, { name: '' });
  var el = root.children[0];
  el.setAttribute = function () {
    throw new Error('should not set attributes');
  };
  el.removeAttribute = function () {
    throw new Error('should not remove attributes');
  };
  app.update({ name: '' })
})

it('should update the real value of input fields', function () {
  var Input = component({
    render: function(props, state){
      return dom('input', { value: props.value })
    }
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Input, {
    value: 'Bob'
  });

  assert.equal(el.querySelector('input').value, 'Bob');
  app.update({ value: 'Tom' });
  assert.equal(el.querySelector('input').value, 'Tom');
})

it('should render innerHTML', function () {
  var Test = component(function(){
    return dom('div', { innerHTML: 'Hello <strong>deku</strong>' });
  });
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Test);
  assert.equal(el.innerHTML,'<div>Hello <strong>deku</strong></div>');
})

it('should update innerHTML', function () {
  var Test = component(function(props){
    return dom('div', { innerHTML: props.content });
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Test, {
    content: 'Hello <strong>deku</strong>'
  });

  app.update({ content: 'Hello <strong>Pluto</strong>' });
  assert.equal(el.innerHTML,'<div>Hello <strong>Pluto</strong></div>');
})
