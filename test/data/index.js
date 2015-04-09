
import {component,dom,deku,value} from '../../';
import {div} from '../helpers';
import assert from 'assert';

it('should get default value from data value', function(){
  var Test = component(template)
    .prop('text', value('meta').pick('title'));

  var app = deku()
    .set('renderImmediate', true)
    .source('meta', metaSource);

  var el = div();

  app.mount(el, Test);
  assert.equal(el.innerHTML, '<div>Hello World</div>');

  function template(props) {
    return dom('div', {}, props.text);
  }

  function metaSource(app) {
    app.value('meta', { title: 'Hello World' });
  }
});

it('should update with new value from data source', function(){
  var Test = component(template)
    .prop('text', value('meta').pick('title'));

  var app = deku()
    .set('renderImmediate', true)
    .source('meta', metaSource);

  var el = div();

  app.mount(el, Test);
  assert.equal(el.innerHTML, '<div>Hello World</div>');
  debugger;
  app.value('meta', { title: 'Hello Pluto' });
  assert.equal(el.innerHTML, '<div>Hello Pluto</div>');

  function template(props) {
    return dom('div', {}, props.text);
  }

  function metaSource(app) {
    app.value('meta', { title: 'Hello World' });
  }
});
