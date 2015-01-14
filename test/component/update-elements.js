
describe('Patching Element Nodes', function(){

  /**
   * Custom components used for testing
   */

  var Toggle = component({
    render: function(props, state){
      if (!props.showChildren) {
        return dom('div');
      } else {
        return dom('div', null, [dom('span', { id: 'foo' })]);
      }
    }
  });

  var CustomTag = component({
    render: function(props, state){
      return dom(props.type);
    }
  });

  var AdjacentTest = component({
    render: function(props, state){
      if (props.i === 1) return dom('div', { id: 'root' }, [dom('span', { id: 'foo' }), dom('span', { id: 'bar' }), dom('span', { id: 'baz' })]);
      if (props.i === 2) return dom('div', { id: 'root' }, [dom('span', { id: 'foo' })]);
    }
  });

  var BasicComponent = component({
    render: function(props, state){
      return dom('div', null, ['component']);
    }
  });

  var ComponentToggle = component({
    render: function(props, state){
      if (!props.showComponent) {
        return dom('span');
      } else {
        return dom(BasicComponent);
      }
    }
  });

  /**
   * When updating a component it should add new elements
   * that are created on the new pass. These elements should
   * be added to the DOM.
   */

  it('should add element nodes', function(){
    var scene = Toggle.render(el, { showChildren: false });
    assert.equal(el.innerHTML, '<div></div>');
    scene.setProps({ showChildren: true });
    scene.update();
    assert.equal(el.innerHTML, '<div><span id="foo"></span></div>');
    scene.remove();
  });

  /**
   * When updating a component it should remove elements
   * from the DOM that don't exist in the new rendering.
   */

  it('should remove element nodes', function(){
    var scene = Toggle.render(el, { showChildren: true });
    assert.equal(el.innerHTML, '<div><span id="foo"></span></div>');
    scene.setProps({ showChildren: false });
    scene.update();
    assert.equal(el.innerHTML, '<div></div>');
    scene.remove();
  });

  /**
   * When updating a component it should remove child elements
   * from the DOM that don't exist in the new rendering.
   */

  it('should only remove adjacent element nodes', function(){
    var scene = AdjacentTest.render(el, { i: 1 });
    assert(document.querySelector('#foo'));
    assert(document.querySelector('#bar'));
    assert(document.querySelector('#baz'));
    scene.setProps({ i: 2 });
    scene.update();
    assert(document.querySelector('#foo'));
    assert(document.querySelector('#bar') == null);
    assert(document.querySelector('#baz') == null);
    scene.remove();
  });

  /**
   * It should change the tag name of element and keep
   * the same content.
   */

  it('should change tag names', function(){
    var scene = CustomTag.render(el, { type: 'span' });
    assert.equal(el.innerHTML, '<span></span>');
    scene.setProps({ type: 'div' });
    scene.update();
    assert.equal(el.innerHTML, '<div></div>');
    scene.remove();
  });

  /**
   * Because the root node has changed, when updating the mounted component
   * should have it's element updated so that it applies the diff patch to
   * the correct element.
   */

  it('should change tag names and still update correctly', function(){
    var ComponentA = component({
      render: function(props, state){
        return dom(props.type, null, props.text);
      }
    });
    var Test = component({
      render: function(props, state){
        return dom(ComponentA, { type: props.type, text: props.text });
      }
    });
    var scene = Test.render(el, { type: 'span', text: 'test' });
    assert.equal(el.innerHTML, '<span>test</span>');
    scene.setProps({ type: 'div', text: 'test' });
    scene.update();
    assert.equal(el.innerHTML, '<div>test</div>');
    scene.setProps({ type: 'div', text: 'foo' });
    scene.update();
    assert.equal(el.innerHTML, '<div>foo</div>');
    scene.remove();
  });

  /**
   * When a node is removed from the tree, all components within that
   * node should be recursively removed and unmounted.
   */

  it('should unmount components when removing an element node', function(){
    var i = 0;
    function inc() { i++ }
    var UnmountTest = component({
      afterUnmount: inc,
      beforeUnmount: inc
    });
    var App = component({
      render: function(props, state){
        if (props.showElements) {
          return dom('div', null, [
            dom('div', null, [
              dom(UnmountTest)
            ])
          ]);
        }
        else {
          return dom('div');
        }
      }
    });
    var scene = App.render(el, { showElements: true });
    scene.setProps({ showElements: false });
    scene.update();
    assert.equal(i, 2);
    scene.remove();
  });

  /**
   * When a component has another component directly rendered
   * with it, it should be able to swap out the type of element
   * that is rendered.
   */

  it('should change sub-component tag names', function(){
    var Test = component({
      render: function(props, state){
        return dom(CustomTag, { type: props.type });
      }
    });
    var scene = Test.render(el, { type: 'span' });
    scene.setProps({ type: 'div' });
    scene.update();
    assert.equal(el.innerHTML, '<div></div>');
    scene.remove();
  });

  /**
   * It should be able to render new components when re-rendering
   */

  it('should replace elements with component nodes', function(){
    var Test = component({
      render: function(props, state){
        if (props.showElement) {
          return dom('span', null, ['element']);
        } else {
          return dom(BasicComponent);
        }
      }
    });
    var scene = Test.render(el, { showElement: true });
    assert.equal(el.innerHTML, '<span>element</span>');
    scene.setProps({ showElement: false });
    scene.update();
    assert.equal(el.innerHTML, '<div>component</div>');
    scene.remove();
  });

  /**
   * If the component type changes at a node, the first component
   * should be removed and unmount and replaced with the new component
   */

  it('should replace components', function(done){
    var ComponentA = component({
      render: function(props, state){
        return dom('div', null, ['A']);
      }
    });
    var ComponentB = component({
      render: function(props, state){
        return dom('div', null, ['B']);
      }
    });
    var ComponentC = component({
      render: function(props, state){
        if (props.type === 'A') return dom(ComponentA);
        return dom(ComponentB);
      }
    });
    var mount = ComponentC.render(el, { type: 'A' });
    assert.equal(el.innerHTML, '<div>A</div>');
    mount.setProps({ type: 'B' }, function(){
      assert.equal(el.innerHTML, '<div>B</div>');
      assert(mount.entity.children['0'].component instanceof ComponentB);
      done();
    });
  })

  /**
   * It should remove components from the children hash when they
   * are moved from the tree.
   */

  it('should remove references to child components when they are removed', function(){
    var scene = ComponentToggle.render(el, { showComponent: true });
    assert(scene.entity.children['0']);
    scene.setProps({ showComponent: false });
    scene.update();
    assert(scene.entity.children['0'] == null);
  });

});