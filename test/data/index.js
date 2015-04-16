
import {component,dom,deku} from '../../';
import trigger from 'trigger-event'
import {div} from '../helpers';
import assert from 'assert';

it('should get default value from data value', function(){
  var Test = component(template)
    .prop('data', { source: 'meta' });

  var app = deku()
    .set('renderImmediate', true)
    .source('meta', { title: 'Hello World' });

  var el = div();

  app.mount(el, Test);
  assert.equal(el.innerHTML, '<div>Hello World</div>');

  function template(props) {
    return dom('div', {}, props.data.title);
  }
});

it('should update with new value from data source', function(){
  var Test = component(template)
    .prop('text', { source: 'title' });

  var app = deku()
    .set('renderImmediate', true)
    .source('title', 'Hello World');

  var el = div();

  app.mount(el, Test);
  assert.equal(el.innerHTML, '<div>Hello World</div>');
  app.value('title', 'Hello Pluto');
  assert.equal(el.innerHTML, '<div>Hello Pluto</div>');

  function template(props) {
    return dom('div', {}, props.text);
  }
});
