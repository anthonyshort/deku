import trigger from 'trigger-event'
import raf from 'component-raf'
import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,div} from '../helpers'

var AttrComponent = component(function(props, state){
  var attrs = {};
  if (props.name) attrs.name = props.name;
  return dom('span', attrs);
});

it('should add/update/remove attributes', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(AttrComponent);
  assert.equal(el.innerHTML, '<span></span>')
  app.update({ name: 'Bob' })
  assert.equal(el.innerHTML, '<span name="Bob"></span>')
  app.update({ name: 'Tom' })
  assert.equal(el.innerHTML, '<span name="Tom"></span>')
  app.update({ name: null })
  assert.equal(el.innerHTML, '<span></span>')
})

it('should not touch the DOM if attributes have not changed', function(){
  var pass = true;
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(AttrComponent, {
    name: 'Bob'
  });
  el.setAttribute = function(){
    pass = false;
  };
  app.update({ name: 'Bob' })
  assert(pass)
})

it('should update the real value of input fields', function () {
  var Input = component({
    render: function(props, state){
      return dom('input', { value: props.value })
    }
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(Input, {
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
  app.layer('main', el);
  app.mount(Test);
  assert.equal(el.innerHTML,'<div>Hello <strong>deku</strong></div>');
})

it('should update innerHTML', function () {
  var Test = component(function(props){
    return dom('div', { innerHTML: props.content });
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(Test, {
    content: 'Hello <strong>deku</strong>'
  });

  app.update({ content: 'Hello <strong>Pluto</strong>' });
  assert.equal(el.innerHTML,'<div>Hello <strong>Pluto</strong></div>');
})
