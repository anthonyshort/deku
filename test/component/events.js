
var trigger = require('adamsanderson/trigger-event');
var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('events', function(){

  it('should add click event', function(){
    var count = 0;
    var Page = component({
      render: function(dom, state, props){
        return dom('span', { onClick: onclick }, ['Hello World']);
      }
    });

    Page.render(el, { x: 20 });
    assert.equal(el.innerHTML, '<span>Hello World</span>');
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);

    function onclick(e, state, props) {
      assert(this instanceof Page);
      assert(props.x, 10);
      ++count;
    }
  });

  it('should remove click event', function(done){
    var count = 0;
    var Page = component({
      render: function(dom, state, props){
        if (props.click) {
          return dom('span', { onClick: onclick }, ['Hello World']);
        } else {
          return dom('span', {}, ['Hello World']);
        }
      },
      afterUpdate: function(){
        trigger(el.querySelector('span'), 'click');
        assert.equal(count, 1);
        done();
      }
    });
    var mount = Page.render(el, { click: true });
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);
    mount.setProps({ click: false });
    function onclick() {
      ++count;
    }
  });

  it('should update click event', function(done){
    var mount;
    var count = 0;

    var Page = component({
      render: function(dom, state, props){
        return dom('span', { onClick: props.click }, ['Hello World']);
      },
      afterUpdate: function(){
        requestAnimationFrame(function(){
          trigger(el.querySelector('span'), 'click');
          assert.equal(count, 0);
          done();
        });
      }
    });

    mount = Page.render(el, { click: onclicka });
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);
    mount.setProps({ click: onclickb });

    function onclicka() {
      count += 1;
    }

    function onclickb() {
      count -= 1;
    }
  });
});
