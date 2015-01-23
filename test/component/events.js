
var trigger = require('adamsanderson/trigger-event');
var raf = require('component/raf');

describe('Events', function(){

  it('should add click event', function(){
    var count = 0;
    var Page = component({
      render: function(props, state){
        return dom('span', { onClick: onclick }, ['Hello World']);
      }
    });

    this.scene = Page.render(el, { x: 20 });
    this.scene.update();
    assert.equal(el.innerHTML, '<span>Hello World</span>');
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);

    function onclick(e, props, state) {
      assert(this instanceof Page);
      assert(props.x, 10);
      ++count;
    }
  });

  it('should remove click event', function(done){
    var count = 0;
    var Page = component({
      render: function(props, state){
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
    this.scene = Page.render(el, { click: true });
    this.scene.update();
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);
    this.scene.setProps({ click: false });
    function onclick() {
      ++count;
    }
  });

  it('should update click event', function(done){
    var count = 0;

    var Page = component({
      render: function(props, state){
        return dom('span', { onClick: props.click }, ['Hello World']);
      },
      afterUpdate: function(){
        raf(function(){
          trigger(el.querySelector('span'), 'click');
          assert.equal(count, 0);
          done();
        });
      }
    });

    this.scene = Page.render(el, { click: onclicka });
    this.scene.update();

    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);
    this.scene.setProps({ click: onclickb });

    function onclicka() {
      count += 1;
    }

    function onclickb() {
      count -= 1;
    }
  });
});
