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
  var app = world(Toggle)
    .setProps({ showText: false })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div></div>')
    app.setProps({ showText: true, text: 'bar' })
    renderer.render()
    assert.equal(el.innerHTML, '<div>bar</div>')
    app.setProps({ text: 'Hello Pluto' })
    renderer.render()
    assert.equal(el.innerHTML, '<div>Hello Pluto</div>')
    app.setProps({ showText: false })
    renderer.render()
    assert.equal(el.innerHTML, '<div></div>')
  })
})
