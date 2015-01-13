
describe('Patching Text Nodes', function(){

  var TextComponent = component(function(dom, state, props){
    return dom('span', null, props.text);
  });

  var Toggle = component({
    render: function(dom, state, props) {
      if (props.showElement) return dom('div', null, [dom('span')]);
      if (props.showText) return dom('div', null, ['bar']);
      return dom('div');
    }
  });

  it('should update text nodes', function(){
    var scene = TextComponent.render(el, { text: 'Hello World' });
    assert.equal(el.innerHTML, '<span>Hello World</span>');
    scene.setProps({ text: 'Hello Pluto' });
    scene.update();
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
    scene.remove();
  });

  it('should add text node', function(){
    var scene = Toggle.render(el, { showText: false });
    assert.equal(el.innerHTML, '<div></div>');
    scene.setProps({ showText: true });
    scene.update();
    assert.equal(el.innerHTML, '<div>bar</div>');
    scene.update();
    scene.remove();
  });

  it('should remove text nodes', function(){
    var scene = Toggle.render(el, { showText: true });
    assert.equal(el.innerHTML, '<div>bar</div>');
    scene.setProps({ showText: false });
    scene.update();
    assert.equal(el.innerHTML, '<div></div>');
    scene.update();
    scene.remove();
  });

  it('should replace elements with text elements', function(){
    var scene = Toggle.render(el, { showElement: true });
    assert.equal(el.innerHTML, '<div><span></span></div>');
    scene.setProps({ showElement: false, showText: true });
    scene.update();
    assert.equal(el.innerHTML, '<div>bar</div>');
    scene.remove();
  });

  it('should replace text nodes with elements', function(){
    var scene = Toggle.render(el, { showElement: false, showText: true });
    assert.equal(el.innerHTML, '<div>bar</div>');
    scene.setProps({ showElement: true, showText: false });
    scene.update();
    assert.equal(el.innerHTML, '<div><span></span></div>');
    scene.remove();
  });

});