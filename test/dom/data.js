/** @jsx dom */

import {deku} from '../../'
import trigger from 'trigger-event'
import {mount} from '../helpers'
import assert from 'assert'
import dom from 'virtual-element'

it('should get default value from data value', function(){
  var Test = {
    propTypes: {
      'data': { source: 'meta' }
    },
    render: function(component) {
      let {props, state} = component
      return <div>{props.data.title}</div>
    }
  }

  var app = deku()
    .set('meta', { title: 'Hello World' })
    .mount(<Test />)

  mount(app, function(el){
    assert.equal(el.innerHTML, '<div>Hello World</div>');
  })
});

it('should update with new value from data source', function(){
  var Test = {
    propTypes: {
      'text': { source: 'title' }
    },
    render: function(component) {
      let {props, state} = component
      return <div>{props.text}</div>
    }
  }

  var app = deku()
    .set('title', 'Hello World')
    .mount(<Test />)

  mount(app, function(el){
    assert.equal(el.innerHTML, '<div>Hello World</div>')
    app.set('title', 'Hello Pluto')
    assert.equal(el.innerHTML, '<div>Hello Pluto</div>')
  })
})

it('should handle two-way updating', function(){
  var Test = {
    propTypes: {
      'text': { source: 'title' },
      'updateTitle': { source: 'setTitle' }
    },
    render: function(component) {
      let {props, state} = component
      return dom('div', { onClick: onClick }, props.text);

      function onClick() {
        props.updateTitle('Hello Pluto');
      }
    }
  }

  function setTitle(string) {
    app.set('title', string);
  }

  var app = deku()
    .set('title', 'Hello World')
    .set('setTitle', setTitle)
    .mount(<Test />)

  mount(app, function(el, renderer){
    document.body.appendChild(el);
    assert.equal(el.innerHTML, '<div>Hello World</div>');
    trigger(el.querySelector('div'), 'click');
    assert.equal(el.innerHTML, '<div>Hello Pluto</div>');
    document.body.removeChild(el);
  })
})

it('should handle two-way updating with multiple components depending on the same source', function(){
  var TestA = {
    propTypes: {
      'text': { source: 'title' },
      'updateTitle': { source: 'setTitle' }
    },
    render: function(component) {
      let {props, state} = component
      return dom('span', { onClick: onClick }, props.text);

      function onClick() {
        props.updateTitle('Hello Pluto');
      }
    }
  }

  var TestB = {
    propTypes: {
      'text': { source: 'title' },
    },
    render: function(component) {
      let {props, state} = component
      return dom('span', null, props.text);
    }
  }

  function setTitle(string) {
    app.set('title', string);
  }

  var app = deku()
    .set('title', 'Hello World')
    .set('setTitle', setTitle)
    .mount(<div><TestA /><TestB /></div>)

  mount(app, function(el, renderer){
    document.body.appendChild(el);
    assert.equal(el.innerHTML, '<div><span>Hello World</span><span>Hello World</span></div>');
    trigger(el.querySelector('span'), 'click');
    assert.equal(el.innerHTML, '<div><span>Hello Pluto</span><span>Hello Pluto</span></div>');
    document.body.removeChild(el);
  })
});
