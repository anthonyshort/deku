import assert from 'assert'
import {component,dom,scene} from '../../'
import {mount} from '../helpers'

var TextComponent = component(function(props, state){
  return dom('span', null, props.text);
});

var Toggle = component({
  render: function(props, state) {
    if (props.showElement) return dom('div', null, [dom('span')]);
    if (props.showText) return dom('div', null, ['bar']);
    return dom('div');
  }
});

it('should update text nodes', function(){
  var app = scene(TextComponent)
    .setProps({ text: 'Hello World' })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<span>Hello World</span>')
    app.setProps({ text: 'Hello Pluto' })
    renderer.render()
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
  })
});

it('should add text node', function(){
  var app = scene(Toggle)
    .setProps({ showText: false })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div></div>')
    app.setProps({ showText: true })
    renderer.render()
    assert.equal(el.innerHTML, '<div>bar</div>')
  })
})

it('should remove text node', function(){
  var app = scene(Toggle)
    .setProps({ showText: true })

  mount(app, function(el, renderer){
    assert.equal(el.innerHTML, '<div>bar</div>')
    app.setProps({ showText: false })
    renderer.render()
    assert.equal(el.innerHTML, '<div></div>')
  })
})
