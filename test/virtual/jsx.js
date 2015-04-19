/** @jsx dom */

var assert = require('assert');
var dom = require('../../lib/virtual');

it('render nodes that work with JSX', function(){
  assert.deepEqual(
    <div class="one" id="foo">Hello World</div>,
    dom('div', { class: "one", id: "foo" }, ['Hello World'])
  );
});