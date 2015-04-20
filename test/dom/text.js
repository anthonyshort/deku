/** @jsx dom */

import assert from 'assert'
import {component,dom,deku} from '../../'
import {mount,div} from '../helpers'

var Toggle = {
  render: function(props, state) {
    if (props.showText) return dom('div', null, [props.text]);
    return dom('div');
  }
};

it('should add/update/remove text nodes', function(){
  var app = deku()
  app.mount(<Toggle showText={false} />);

  mount(app, function(el){
    assert.equal(el.innerHTML, '<div></div>')
    app.mount(<Toggle showText={true} text="bar" />);
    assert.equal(el.innerHTML, '<div>bar</div>')
    app.mount(<Toggle showText={true} text="Hello Pluto" />);
    assert.equal(el.innerHTML, '<div>Hello Pluto</div>')
    app.mount(<Toggle showText={false} />);
    assert.equal(el.innerHTML, '<div></div>')
  })
})
