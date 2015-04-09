
import {component,dom,deku} from '../../'
import assert from 'assert'
import {mount,div} from '../helpers'

it('mount multiple layers', function(){
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

it('update multiple layers', function(){
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
  app.update({ text: 'An updated dialog!' });
  assert.equal(dialog.innerHTML, '<div>An updated dialog!</div>');

  function mainLayer(props) {
    return dom('div', {}, [ 'A page' ]);
  }

  function dialogLayer(props) {
    return dom(Dialog, { message: props.text || 'A dialog' });
  }
});

