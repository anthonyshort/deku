/** @jsx dom */

import {mount,div} from '../helpers'
import {component,render,deku,dom} from '../../'
import assert from 'assert'

it('should set source without property type', function(done){
  const App = {
    propTypes: {
      foo: {
        source: 'foo'
      }
    },

    render(comp) {
      let {props} = comp;
      let {foo} = props;

      return (
        <div>
          {foo || 'App'}
        </div>
      );
    }
  }

  var el = document.createElement('div');
  var app = deku(<App/>);
  render(app, el);
  app.set('foo', 'bar');
  requestAnimationFrame(function(){
    assert.equal(el.innerHTML, '<div>bar</div>');
    done();
  });
});

it('should handle removing entities', function(done){
  const App = {
    propTypes: {
      foo: { source: 'foo' }
    },

    render(component) {
      let {props} = component;
      let {foo} = props;
      let page = foo ? <Page2/> : <Page1/>

      return <div>{page}</div>
    }
  }

  const Page1 = {
    propTypes: {
      foo: { source: 'foo' }
    },

    render(component) {
      return <div class="Page1">Page1</div>
    }
  }

  const Page2 = {
    propTypes: {
      foo: { source: 'foo' }
    },

    render(component) {
      return <div class="Page2">Page2</div>
    }
  }

  var el = document.createElement('div');
  var app = deku(<App/>);
  render(app, el);
  app.set('foo', 'bar');
  requestAnimationFrame(function(){
    assert.equal(el.innerHTML, '<div><div class="Page2">Page2</div></div>');
    app.set('foo', false);
    requestAnimationFrame(function(){
      assert.equal(el.innerHTML, '<div><div class="Page1">Page1</div></div>');
      done();
    });
  });
});
