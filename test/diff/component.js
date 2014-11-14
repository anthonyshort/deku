var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('components', function(){

  it.skip('should remove nested components when switching tag names', function(){
    var i = 0;
    function inc() { i++ }
    var ComponentA = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', null, ['test']);
      }
    });
    var ComponentB = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n(ComponentA);
      }
    });
    var ComponentC = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        if (props.n === 0) {
          return n('div', null, [
            n('div', null, [
              n(ComponentB),
              n(ComponentA)
            ])
          ]);
        }
        else {
          n('span', null, [
            n(ComponentB),
            n(ComponentA)
          ])
        }
      }
    });
    var mount = ComponentC.render(el, { n: 0 });
    mount.set({ n: 1 })
    assert.equal(i, 6);
  });

  it('should remove nested components when removing a branch', function(){
    var i = 0;
    function inc() { i++ }
    var ComponentA = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n('span', null, ['test']);
      }
    });
    var ComponentB = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        return n(ComponentA);
      }
    });
    var ComponentC = component({
      unmount: inc,
      beforeUnmount: inc,
      render: function(n, state, props){
        if (props.n === 0) {
          return n('div', null, [
            n('div', null, [
              n(ComponentB),
              n(ComponentA)
            ])
          ]);
        }
        else {
          return n('div');
        }
      }
    });
    var mount = ComponentC.render(el, { n: 0 });
    mount.set({ n: 1 })
    assert.equal(i, 6);
  });

  it.skip('should change sub-component tag names', function(){
    var i = 0;
    var ComponentA = component({
      render: function(n, state, props){
        return n(props.type, null, ['test']);
      }
    });
    var ComponentB = component({
      render: function(n){
        return n(ComponentA);
      }
    });
    var mount = ComponentB.render(el, { type: 'span' });
    mount.set({ type: 'div' })
    assert.equal(el.innerHTML, '<div>test</div>');
  });

});
