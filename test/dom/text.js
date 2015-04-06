import assert from 'assert'
import {component,dom,world} from '../../'
import {mount} from '../helpers'

var Toggle = component({
  render: function(props, state) {
    if (props.showText) return dom('div', null, [props.text]);
    return dom('div');
  }
});

it('should add/update/remove text nodes', function(){
  var world = World().set('renderImmediate', true);
  var el = div();
  world.mount(el, Toggle, { showText: false });

  assert.equal(el.innerHTML, '<div></div>')
  world.update({ showText: true, text: 'bar' });
  assert.equal(el.innerHTML, '<div>bar</div>')
  world.update({ text: 'Hello Pluto' });
  assert.equal(el.innerHTML, '<div>Hello Pluto</div>')
  world.update({ showText: false });
  assert.equal(el.innerHTML, '<div></div>')
})
