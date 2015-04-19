/** @jsx dom */

import {dom,deku} from '../../';
import trigger from 'trigger-event'
import {mount} from '../helpers';
import assert from 'assert';

it('should get default value from data value', function(){
  var Test = {
    props: {
      'data': { source: 'meta' }
    },
    render: function(props) {
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
    props: {
      'text': { source: 'title' }
    },
    render: function(props) {
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
    props: {
      'text': { source: 'title' },
      'updateTitle': { source: 'setTitle' }
    },
    render: function(props, state) {
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
});
