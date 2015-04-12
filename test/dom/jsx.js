/** @jsx dom */

import assert from 'assert';
import {component,deku,dom,render} from '../../';

it('should support JSX', function(){
  var Test = component(function(){
    return <div>Hello World</div>;
  });
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Test);
  assert.equal(el.innerHTML, '<div>Hello World</div>');
})
