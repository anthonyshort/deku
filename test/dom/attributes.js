/** @jsx dom */

import trigger from 'trigger-event'
import raf from 'component-raf'
import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,div} from '../helpers'

var AttrComponent = {
  render: function(props, state){
    return dom('span', { name: props.name });
  }
}

it('should add/update/remove attributes', function(){
  var app = deku()
  app.mount(<AttrComponent />);
  mount(app, function(el){
    assert.equal(el.innerHTML, '<span></span>')
    app.mount(<AttrComponent name="Bob" />)
    assert.equal(el.innerHTML, '<span name="Bob"></span>')
    app.mount(<AttrComponent name="Tom" />)
    assert.equal(el.innerHTML, '<span name="Tom"></span>')
    app.mount(<AttrComponent name={null} />)
    assert.equal(el.innerHTML, '<span></span>')
    app.mount(<AttrComponent name={undefined} />)
    assert.equal(el.innerHTML, '<span></span>')
  })
})

it('should not touch the DOM if attributes have not changed', function(){
  var app = deku()
  app.mount(<AttrComponent name='Bob' />);
  mount(app, function(el){
    var target = el.children[0];
    target.setAttribute = function(){
      throw new Error('should not set attributes');
    };
    app.mount(<AttrComponent name='Bob' />);
  })
})

it('should not touch the DOM just because attributes are falsy', function () {
  var app = deku()
  app.mount(<AttrComponent name="" />);
  mount(app, function(root){
    var el = root.children[0];
    el.setAttribute = function () {
      throw new Error('should not set attributes');
    };
    el.removeAttribute = function () {
      throw new Error('should not remove attributes');
    };
    app.mount(<AttrComponent name="" />);
  })
})

it('should update the real value of input fields', function () {
  var Input = {
    render: function(props, state){
      return dom('input', { value: props.value })
    }
  };

  var app = deku()
  app.mount(<Input value="Bob" />);

  mount(app, function(el){
    assert.equal(el.querySelector('input').value, 'Bob');
    app.mount(<Input value="Tom" />);
    assert.equal(el.querySelector('input').value, 'Tom');
  })
})

it('should render and update innerHTML', function () {
  var Test = {
    render: function(props){
      return dom('div', { innerHTML: props.content });
    }
  }

  var app = deku()
  app.mount(<Test content="Hello <strong>deku</strong>" />)

  mount(app, function(el){
    assert.equal(el.innerHTML,'<div>Hello <strong>deku</strong></div>');
    app.mount(<Test content="Hello <strong>Pluto</strong>" />)
    assert.equal(el.innerHTML,'<div>Hello <strong>Pluto</strong></div>');
  })
})
