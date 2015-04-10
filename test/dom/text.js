import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,div} from '../helpers'

var Toggle = component({
  render: function(props, state) {
    if (props.showText) return dom('div', null, [props.text]);
    return dom('div');
  }
});

it('should add/update/remove text nodes', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(Toggle, { showText: false });

  assert.equal(el.innerHTML, '<div></div>')
  app.update({ showText: true, text: 'bar' });
  assert.equal(el.innerHTML, '<div>bar</div>')
  app.update({ text: 'Hello Pluto' });
  assert.equal(el.innerHTML, '<div>Hello Pluto</div>')
  app.update({ showText: false });
  assert.equal(el.innerHTML, '<div></div>')
})
