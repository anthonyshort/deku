
var trigger = require('trigger-event');
var raf = require('component-raf');
var classes = require('component-classes');

describe('Events', function(){

  var Delegate = component({
    render: function (props, state) {
      var active = state.active || 0;
      var self = this;
      var items = [1,2,3].map(function(i){
        return dom('li', {
          onClick: function(){
            self.setState({ active: i })
          },
          class: { active: active === i }
        }, [
          dom('a', 'link')
        ]);
      });
      return dom('ul', items);
    }
  });

  it('should add click event', function(){
    var count = 0;
    var Page = component({
      render: function(props, state){
        return dom('span', { onClick: onclick }, ['Hello World']);
      }
    });

    var scene = Page.render(el, { x: 20 });
    scene.update();
    assert.equal(el.innerHTML, '<span>Hello World</span>');
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);
    function onclick(e, props, state) {
      assert(this instanceof Page);
      assert(props.x, 10);
      ++count;
    }
    scene.remove();
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
    var scene = Page.render(el, { click: true });
    scene.update();
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);
    scene.setProps({ click: false });
    scene.update();
    assert.equal(count, 1);
    function onclick() {
      ++count;
    }
    scene.remove();
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

  it('should delegate events', function () {
    var scene = Delegate.render(el);
    scene.update();

    // Click the first link
    var first = el.querySelectorAll('a')[0];
    trigger(first, 'click');
    scene.update();

    assert(classes(first.parentNode).has('active'), 'it should add the active class on the first li');

    var second = el.querySelectorAll('a')[1];
    trigger(second, 'click');
    scene.update();
    assert(classes(second.parentNode).has('active'), 'it should add the active class on the second li');
    assert(classes(first.parentNode).has('active') === false, 'it should remove the active class on the first li');
    scene.remove();
  });

  it('should delegate events on the root', function () {
    var DelegateRoot = component({
      onClick: function(event){
        this.setState({ active: true });
      },
      render: function (props, state) {
        return dom('div', { class: { active: state.active }, onClick: this.onClick }, [
          dom('a', 'link')
        ]);
      }
    });

    var scene = DelegateRoot.render(el);
    scene.update();

    // Click the link
    var first = el.querySelectorAll('a')[0];
    trigger(first, 'click');
    scene.update();
    assert(classes(first.parentNode).has('active') === true);

    scene.remove();
  });

  it('should set a delegateTarget', function (done) {
    var DelegateRoot = component({
      onClick: function(event){
        assert(event.delegateTarget === el.querySelector('div'));
        done();
      },
      render: function (props, state) {
        return dom('div', { onClick: this.onClick }, [
          dom('a', 'link')
        ]);
      }
    });

    var scene = DelegateRoot.render(el);
    scene.update();

    // Click the link
    var first = el.querySelectorAll('a')[0];
    trigger(first, 'click');
    scene.update();
    scene.remove();
  });

  it('should update events when nested children are removed', function () {
    var scene;
    var items = [
      { text: 'one' },
      { text: 'two' },
      { text: 'three' }
    ];
    var Button = component({
      render: function(props, state){
        return dom('a', { onClick: props.onClick })
      }
    });
    var ListItem = component({
      render: function(props, state){
        var invalidate = this.invalidate;
        return dom('li', [
          Button({
            onClick: function(){
              var changed = props.items.concat();
              changed.splice(props.index, 1);
              scene.setProps({ items: changed });
              invalidate();
              scene.update();
            }
          })
        ]);
      }
    });
    var List = component({
      render: function (props, state) {
        return dom('ul', [
          props.items.map(function(item, i){
            return ListItem({
              data: item,
              index: i,
              items: props.items
            });
          })
        ]);
      }
    });
    scene = List.render(el, { items: items });
    scene.update();
    trigger(el.querySelector('a'), 'click');
    trigger(el.querySelector('a'), 'click');
    trigger(el.querySelector('a'), 'click');
    assert.equal(el.innerHTML, '<ul></ul>');
    scene.remove();
  });

  it('should return a Promise from setState', function(done){
    var Button = component({
      render: function(props, state){
        return dom('a');
      },
      afterMount: function(){
        this.setState({foo: 'bar'})
          .then(function(){
            scene.remove();
            done();
          });
      }
    });

    scene = Button.render(el, {});
    scene.update();
  })

});
