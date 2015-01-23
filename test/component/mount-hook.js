
describe('Mounting Hooks', function(){

  it('should fire the `afterMount` hook', function(done){
    var Page = component({
      afterMount: function(){
        done();
      }
    });
    var scene = Page.render(el);
    scene.update();
    scene.remove();
  })

  it('should fire the `afterUnmount` hook', function(done){
    var Page = component({
      afterUnmount: function(){
        done();
      }
    });
    var scene = Page.render(el)
    scene.update();
    scene.remove();
  })

  it('should fire the `beforeMount` hook before `mount`', function(){
    var pass;
    var Page = component({
      beforeMount: function(){
        pass = false;
      },
      afterMount: function(){
        pass = true;
      }
    });
    var scene = Page.render(el)
    scene.update();
    scene.remove();
    assert(pass);
  })

  it('should fire the `beforeUnmount` hook before `unmount`', function(){
    var pass;
    var Page = component({
      beforeUnmount: function(){
        pass = false;
      },
      afterUnmount: function(){
        pass = true;
      }
    });
    var scene = Page.render(el)
    scene.update();
    scene.remove();
    assert(pass);
  })

  it('should not unmount twice', function(){
    var Page = component();
    var scene = Page.render(el);
    scene.update();
    scene.remove();
    scene.remove();
  })

  it('should fire mount events on sub-components', function(){
    var i = 0;

    function inc() { i++ }

    var ComponentA = component({
      afterMount: inc,
      beforeMount: inc,
      render: function(props, state){
        return dom('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      afterMount: inc,
      beforeMount: inc,
      render: function(props, state){
        return dom(ComponentA, { text: 'foo', name: props.name });
      }
    });

    var scene = ComponentB.render(el, { name: 'Bob' });
    scene.update();
    assert(i === 4, i);
    scene.remove();
  });

  it('should fire unmount events on sub-components', function(){
    var i = 0;

    function inc() { i++ }

    var ComponentA = component({
      afterUnmount: inc,
      beforeUnmount: inc,
      render: function(props, state){
        return dom('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      afterUnmount: inc,
      beforeUnmount: inc,
      render: function(props, state){
        return dom(ComponentA, { text: 'foo', name: props.name });
      }
    });

    var scene = ComponentB.render(el, { name: 'Bob' });
    scene.update();
    scene.remove();
    assert(i === 4, i);
    assert(el.innerHTML === "");
  });

  it('should fire mount events on sub-components created later', function(){
    var calls = 0;
    function inc() { calls++ }

    var ComponentA = component({
      afterMount: inc,
      beforeMount: inc
    });

    var ComponentB = component({
      render: function(props, state){
        if (!props.showComponent) {
          return dom();
        } else {
          return dom(ComponentA);
        }
      }
    });

    var scene = ComponentB.render(el, {
      showComponent: false
    });
    scene.update();
    scene.setProps({
      showComponent: true
    });
    scene.update();
    assert.equal(calls, 2);
    scene.remove();
  });

  it('should fire unmount events on sub-components created later', function(){
    var calls = 0;
    function inc() { calls++ }

    var ComponentA = component({
      afterUnmount: inc,
      beforeUnmount: inc
    });

    var ComponentB = component({
      render: function(props, state){
        if (!props.showComponent) {
          return dom();
        } else {
          return dom(ComponentA);
        }
      }
    });

    var scene = ComponentB.render(el, { showComponent: true });
    scene.update();
    scene.setProps({ showComponent: false });
    scene.update();
    assert.equal(calls, 2);
    scene.remove();
  });

});