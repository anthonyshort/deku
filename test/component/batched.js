
var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('batched rendering', function(){

  it('should update props on the next frame', function () {
    var Component = component({
      render: function(dom, state, props){
        return dom('div', null, [props.text]);
      }
    });
    var mount = Component.render(el, {
      text: 'one'
    });
    mount.setProps({
      text: 'two'
    });
    assert(el.innerHTML === '<div>one</div>');
  });

  it('should setProps and call the callback', function (done) {
    var Component = component({
      render: function(dom, state, props){
        return dom('div', null, [props.text]);
      }
    });
    var mount = Component.render(el, {
      text: 'one'
    });
    mount.setProps({ text: 'two' }, function(){
      assert(el.innerHTML === '<div>two</div>');
      done();
    });
  });

  it('should not update twice when setting props', function (done) {
    var i = 0;
    var Component = component({
      render: function(dom, state, props){
        i++;
        return dom('div', null, [props.text]);
      }
    });
    var mount = Component.render(el, {
      text: 'one'
    });
    mount.setProps({ text: 'two' });
    mount.setProps({ text: 'three' }, function(){
      assert(i === 2);
      done();
    });
  });

  it('should only call `beforeUpdate` once', function (done) {
    var i = 0;
    var Component = component({
      beforeUpdate: function(state, props, prevState, nextProps){
        i++;
        assert(props.text === 'one');
        assert(nextProps.text === 'three');
      },
      render: function(dom, state, props){
        return dom('div', null, [props.text]);
      }
    });
    var mount = Component.render(el, {
      text: 'one'
    });
    mount.setProps({ text: 'two' });
    mount.setProps({ text: 'three' }, function(){
      assert(i === 1);
      done();
    });
  });

});
