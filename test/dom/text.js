/** @jsx dom */

import assert from 'assert'
import {component,dom} from '../../'
import {mount,div} from '../helpers'

var Toggle = {
  render: function(component) {
    let {props, state} = component
    if (props.showText) return dom('div', null, [props.text]);
    return dom('div');
  }
};

it('should add/update/remove text nodes', function(){
  var app = (<Toggle showText={false} />);

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div></div>')
    renderer.mount(<Toggle showText={true} text="bar" />);
    assert.equal(el.innerHTML, '<div>bar</div>')
    renderer.mount(<Toggle showText={true} text="Hello Pluto" />);
    assert.equal(el.innerHTML, '<div>Hello Pluto</div>')
    renderer.mount(<Toggle showText={false} />);
    assert.equal(el.innerHTML, '<div></div>')
  })
})
