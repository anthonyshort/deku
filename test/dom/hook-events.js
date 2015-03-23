describe('Plugin Hooks', function () {

  it('should fire the `beforeMount` event', function(done){
    var Page = component();
    Page.on('beforeMount', function(instance, props, state){
      assert(instance instanceof Page);
      assert(props);
      assert(state);
      done();
    });
    var scene = Page.render(el);
    scene.update()
    scene.remove();
  })

  it('should fire the `afterMount` event', function(done){
    var Page = component();
    Page.on('afterMount', function(instance, el, props, state){
      assert(instance instanceof Page);
      assert(el instanceof HTMLElement);
      assert(props);
      assert(state);
      done();
    });
    var scene = Page.render(el);
    scene.update()
    scene.remove();
  })

  it('should fire the `beforeUpdate` event', function(done){
    var Page = component();
    Page.on('beforeUpdate', function(instance){
      done();
    });
    var scene = Page.render(el, { foo: 'baz' });
    scene.update();
    scene.setProps({ foo: 'bar' });
    scene.update();
    scene.remove();
  })

  it('should fire the `afterUpdate` event', function(done){
    var Page = component();
    Page.on('afterUpdate', function(instance){
      done();
    });
    var scene = Page.render(el, { foo: 'baz' });
    scene.update();
    scene.setProps({ foo: 'bar' });
    scene.update();
    scene.remove();
  })

  it('should fire the `beforeUnmount` event', function(done){
    var Page = component();
    Page.on('beforeUnmount', function(instance){
      assert(instance instanceof Page);
      done();
    });
    var scene = Page.render(el);
    scene.update();
    scene.remove();
  })

  it('should fire the `afterUnmount` event', function(done){
    var Page = component();
    Page.on('afterUnmount', function(instance){
      assert(instance instanceof Page);
      done();
    });
    var scene = Page.render(el);
    scene.update();
    scene.remove();
  })

});