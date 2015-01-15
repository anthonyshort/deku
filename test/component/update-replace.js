
describe('Replacing Nodes', function () {

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