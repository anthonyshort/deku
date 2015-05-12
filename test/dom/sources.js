/** @jsx dom */

import {mount,div} from '../helpers'
import {component,render,deku,dom} from '../../'
import assert from 'assert'

it('should fire mount events on sub-components', function(done){
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
