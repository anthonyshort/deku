
describe('Mounting Hooks', function(){

  it('should fire the `afterMount` hook', function(done){
    var Page = component({
      afterMount: function(){
        done();
      }
    });
    this.scene = Page.render(el);
  })

  it('should fire the `afterUnmount` hook', function(done){
    var Page = component({
      afterUnmount: function(){
        done();
      }
    });
    Page.render(el).remove();
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
    Page.render(el).remove();
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
    Page.render(el).remove();
    assert(pass);
  })

  it('should not unmount twice', function(){
    var Page = component();
    var mount = Page.render(el);
    mount.remove();
    mount.remove();
  })

  it('should fire mount events on sub-components', function(){
    var i = 0;

    function inc() { i++ }

    var ComponentA = component({
      afterMount: inc,
      beforeMount: inc,
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      afterMount: inc,
      beforeMount: inc,
      render: function(n, state, props){
        return n(ComponentA, { text: 'foo', name: props.name });
      }
    });

    var mount = ComponentB.render(el, { name: 'Bob' });
    assert(i === 4, i);
  });

  it('should fire unmount events on sub-components', function(){
    var i = 0;

    function inc() { i++ }

    var ComponentA = component({
      afterUnmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      afterUnmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n(ComponentA, { text: 'foo', name: props.name });
      }
    });

    var mount = ComponentB.render(el, { name: 'Bob' });
    mount.remove();
    assert(i === 4, i);
    assert(el.innerHTML === "");
  });

  it('should fire mount events on sub-components created later', function(done){
    var calls = 0;
    function inc() { calls++ }

    var ComponentA = component({
      afterMount: inc,
      beforeMount: inc
    });

    var ComponentB = component({
      render: function(n, state, props){
        if (!props.showComponent) {
          return n();
        } else {
          return n(ComponentA);
        }
      }
    });

    var scene = ComponentB.render(el, {
      showComponent: false
    });
    scene.setProps({
      showComponent: true
    });
    scene.on('update', function(){
      assert.equal(calls, 2);
      done();
    });
  });

  it('should fire unmount events on sub-components created later', function(done){
    var calls = 0;
    function inc() { calls++ }

    var ComponentA = component({
      afterUnmount: inc,
      beforeUnmount: inc
    });

    var ComponentB = component({
      render: function(n, state, props){
        if (!props.showComponent) {
          return n();
        } else {
          return n(ComponentA);
        }
      }
    });

    var scene = ComponentB.render(el, {
      showComponent: true
    });
    scene.setProps({
      showComponent: false
    });
    scene.on('update', function(){
      assert.equal(calls, 2);
      done();
    });
  });

});