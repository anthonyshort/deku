import assert from 'assert'
import {component,dom,scene} from '../../'
import {mount} from '../helpers'

var Toggle = component({
  render: function(props, state) {
    if (props.showElement) return dom('div', null, [dom('span')]);
    if (props.showText) return dom('div', null, ['bar']);
    return dom('div');
  }
});

it('should replace elements with text elements', function(){
  var app = scene(Toggle)
    .setProps({ showElement: true })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div><span></span></div>')
    app.setProps({ showElement: false, showText: true })
    renderer.render()
    assert.equal(el.innerHTML, '<div>bar</div>')
  })
});

it('should replace text nodes with elements', function(){
  var app = scene(Toggle)
    .setProps({ showElement: false, showText: true })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div>bar</div>')
    app.setProps({ showElement: true, showText: false })
    renderer.render()
    assert.equal(el.innerHTML, '<div><span></span></div>')
  })
});

