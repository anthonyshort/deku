var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('lifecycle events', function(){

  it('should fire the `mount` hook', function (done) {
    var Page = component({
      mount: function(){
        done();
      }
    });
    Page.render(el);
  })

  it('should fire the `unmount` hook', function (done) {
    var Page = component({
      unmount: function(){
        done();
      }
    });
    var mount = Page.render(el);
    mount.remove();
  })

  it('should fire the `beforeMount` hook before `mount`', function (done) {
    var Page = component({
      beforeMount: function(){
        done();
      },
      mount: function(){
        done(false);
      }
    });
    Page.render(el);
  })

  it('should fire the `beforeUnmount` hook before `unmount`', function (done) {
    var Page = component({
      beforeUnmount: function(){
        done();
      },
      unmount: function(){
        done(false);
      }
    });
    Page.render(el).remove();
  })

  it('should not unmount twice', function () {
    var Page = component();
    var mount = Page.render(el);
    mount.remove();
    mount.remove();
  })

  it('should fire mount events on sub-components', function(){
    var i = 0;

    function inc() { i++ }

    var ComponentA = component({
      mount: inc,
      beforeMount: inc,
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      mount: inc,
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
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });

    var ComponentB = component({
      unmount: inc,
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


});
