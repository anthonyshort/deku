import assert from 'assert'
import {component,dom,deku} from '../../'
import {TwoWords,mount,div,Span} from '../helpers'

var Test = component(TwoWords);

it('should merge props on the app', function(){
  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(Test, { one: 'Hello', two: 'deku' });

  app.update({ two: 'Pluto' })
  assert.equal(el.innerHTML, '<span>Hello Pluto</span>')
});

it('should update on the next frame', function(done){
  var app = deku();
  var el = div();
  app.layer('main', el);
  app.mount(Test, { one: 'Hello', two: 'deku' });

  app.update({ one: 'Hello', two: 'Pluto' });
  assert.equal(el.innerHTML, '<span>Hello deku</span>');
  requestAnimationFrame(function(){
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
    done();
  });
});

it.skip('should not update props if the app is removed', function (done) {
  var Test = component(Span);
  var app = deku();
  var el = div();
  app.layer('main', el);
  app.mount(Test, { text: 'foo' });
  var renderer = app.renderer;

  renderer.update = function(){
    done(false)
  }

  app.update({ text: 'bar' });
  app.remove();
  requestAnimationFrame(function(){
    done()
  });
});

it('should not update twice when setting props', function(done){
  var i = 0;
  var IncrementAfterUpdate = component({
    afterUpdate: function(){
      i++;
    }
  });

  var app = deku();
  var el = div();
  app.layer('main', el);
  app.mount(IncrementAfterUpdate, { text: 'one' });
  app.update({ text: 'two' });
  app.update({ text: 'three' });
  requestAnimationFrame(function(){
    assert.equal(i, 1);
    done();
  });
});

it('should update child even when the props haven\'t changed', function () {
  var calls = 0;

  var Child = component({
    render: function(props, state){
      calls++;
      return dom('span', null, [props.text]);
    }
  });

  var Parent = component({
    render: function(props, state){
      return dom('div', { name: props.character }, [
        dom(Child, { text: 'foo' })
      ]);
    }
  });

  var app = deku().set('renderImmediate', true);
  var el = div();
  app.layer('main', el);
  app.mount(Parent, { character: 'Link' });
  app.update({ character: 'Zelda' });
  assert.equal(calls, 2);
});
