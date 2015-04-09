import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,div} from '../helpers'

var Toggle = component({
  render: function(props, state) {
    if (props.showElement) return dom('div', null, [dom('span')]);
    if (props.showText) return dom('div', null, ['bar']);
    return dom('div');
  }
});

it('should replace elements with text elements', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Toggle, { showElement: true });

  assert.equal(el.innerHTML, '<div><span></span></div>')
  app.update({ showElement: false, showText: true })
  assert.equal(el.innerHTML, '<div>bar</div>')
});

it('should replace text nodes with elements', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.mount(el, Toggle, { showElement: false, showText: true });

  assert.equal(el.innerHTML, '<div>bar</div>')
  app.update({ showElement: true, showText: false })
  assert.equal(el.innerHTML, '<div><span></span></div>')
});
