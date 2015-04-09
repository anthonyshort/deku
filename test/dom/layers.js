
import {component,dom,deku} from '../../'
import assert from 'assert'
import {mount,div} from '../helpers'

it('render multiple layers', function(){
  var Page = component()
    .layer('main', mainLayer)
    .layer('dialog', dialogLayer);

  var Dialog = component(function(props){
    return dom('div', {}, [ props.message ]);
  });

  var app = deku().set('renderImmediate', true);
  var dialog = div();
  var main = div();
  app.layer('dialog', dialog);
  app.layer('main', main);
  app.mount(Page);
  assert.equal(main.innerHTML, '<div>A page</div>');
  assert.equal(dialog.innerHTML, '<div>A dialog</div>');

  function mainLayer(props) {
    return dom('div', {}, [ 'A page' ]);
  }

  function dialogLayer(props) {
    return dom(Dialog, { message: 'A dialog' });
  }
});

