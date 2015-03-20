import trigger from 'trigger-event';
import Emitter from 'component-emitter';
import raf from 'component-raf';
import assert from 'assert';
import {component,scene,dom,render} from '../../';
import {HelloWorld,Span,TwoWords,mount,div} from '../helpers';

describe('API', function(){

  it('should render a component', function(){
    var Test = component(HelloWorld);
    var app = scene(Test);
    mount(app, function(el){
      assert.equal(el.innerHTML, '<span>Hello World</span>');
    });
  });

  it('should create a component with just a render function', function () {
    var Simple = component(function(){
      return dom('span', null, 'Hello World');
    });
    mount(scene(Simple), function(el){
      assert.equal(el.innerHTML, '<span>Hello World</span>');
    })
  });

  it('should allow extending the prototype', function(){
    var Page = component();
    Page.prototype.render = function(props, state){
      return dom('span', null, ['Hello World']);
    };
    mount(scene(Page), function(el){
      assert.equal(el.innerHTML, '<span>Hello World</span>');
    })
  });

  it('should mixin plugins when they are objects', function () {
    var plugin = {
      render: function() {
        return dom('span', null, 'Plugin');
      }
    };
    var Test = component();
    Test.use(plugin);
    mount(scene(Test), function(el){
      assert.equal(el.innerHTML, '<span>Plugin</span>');
    })
  });

  it('should call plugins when they are functions', function (done) {
    var Test;
    function plugin(Component) {
      assert.equal(Component, Test);
      done();
    };
    Test = component();
    Test.use(plugin);
  });

  it('should bind `this` to any method', function(done){
    var Page = component({
      hack: function(){
        assert(this instanceof Page);
        done();
      },
      render: function(props, state){
        var fn = this.hack;
        fn();
        return dom();
      }
    });
    mount(scene(Page))
  });

  it('should create a component with properties', function(){
    var Test = component({
      render(props) {
        return dom('span', null, [props.text])
      }
    })
    var app = scene(Test)
    app.setProps({ text: 'Hello World' })
    mount(app, function(el){
      assert.equal(el.innerHTML, '<span>Hello World</span>')
    })
  });

  it('should compose without needing to use dom object', function () {
    var Inner = component(Span);
    var Test = component({
      render: function(props, state){
        return Inner({ text: 'foo' });
      }
    });
    mount(scene(Test), function(el){
      assert.equal(el.innerHTML, '<span>foo</span>');
    })
  });

  it('should remove from the DOM', function () {
    var Test = component(HelloWorld);
    var el = mount(scene(Test));
    assert.equal(el.innerHTML, '');
  });

  it.skip('should not call flush callbacks if removed', function () {
    var Test = component(Span);
    var app = scene(Test);
    app.setProps({ text: 'foo' });
    mount(app)
    app.setProps({ text: 'bar' });
  });

  it('should compose components', function(){
    var Inner = component(HelloWorld);
    var Composed = component({
      render: function(props, state){
        return dom(Inner);
      }
    });
    mount(scene(Composed), function(el){
      assert.equal(el.innerHTML, '<span>Hello World</span>');
    })
  });

  it('should compose components and pass in props', function(){
    var Inner = component(TwoWords);
    var Composed = component(function(props, state){
      return dom(Inner, { one: 'Hello', two: 'World' });
    });
    mount(scene(Composed), function(el){
      assert.equal(el.innerHTML, '<span>Hello World</span>');
    })
  });

  it('should update sub-components', function(){
    var Inner = component(TwoWords);
    var Composed = component(function(props, state){
      return dom('div', null, [
        dom(Inner, { one: 'Hello', two: props.world })
      ]);
    });
    var app = scene(Composed);
    var el = document.createElement('div');
    document.body.appendChild(el);
    var mount = render(app, el);
    app.setProps({ world: 'Pluto' });
    mount.render();
    assert.equal(el.innerHTML, '<div><span>Hello Pluto</span></div>');
    mount.remove();
    document.body.removeChild(el);
  });

  it('should allow components to have child nodes', function () {
    var ComponentA = component({
      render: function(props, state){
        return dom('div', null, props.children);
      }
    });
    var ComponentB = component({
      render: function(props, state){
        return ComponentA(null, [
          dom('span', null, 'Hello World!')
        ]);
      }
    });
    var app = scene(ComponentB);
    mount(app, function(el){
      assert.equal(el.innerHTML, '<div><span>Hello World!</span></div>');
    })
  });

  it('should update component child nodes', function () {
    var ComponentA = component({
      render: function(props, state){
        return dom('div', null, props.children);
      }
    });
    var ComponentB = component({
      render: function(props, state){
        return ComponentA(null, [
          dom('span', null, props.text)
        ]);
      }
    });
    var app = scene(ComponentB);
    mount(app, function(el, rendered){
      app.setProps({ text: 'Hello Pluto!' })
      rendered.render()
      assert.equal(el.innerHTML, '<div><span>Hello Pluto!</span></div>')
    })
  });

  it('should allow components to have other components as child nodes', function () {
    var ComponentA = component({
      render: function(props, state){
        return dom('div', { name: 'ComponentA' }, props.children);
      }
    });
    var ComponentC = component({
      render: function(props, state){
        return dom('div', { name: 'ComponentC' }, props.children);
      }
    });
    var ComponentB = component({
      render: function(props, state){
        return dom('div', { name: 'ComponentB' }, [
          ComponentA(null, [
            ComponentC({ text: props.text }, [
              dom('span', null, 'Hello Pluto!')
            ])
          ])
        ]);
      }
    });

    var app = scene(ComponentB)
      .setProps({ text: 'Hello World!' })

    mount(app, function(el){
      assert.equal(el.innerHTML, '<div name="ComponentB"><div name="ComponentA"><div name="ComponentC"><span>Hello Pluto!</span></div></div></div>');
    })
  });

  it('should only update ONCE when props/state is changed in different parts of the tree', function(){
    var i;
    var emitter = new Emitter();
    var ComponentA = component({
      initialState: function(){
        return {
          text: 'Deku Shield'
        };
      },
      afterMount: function() {
        var self = this;
        emitter.on('data', function(text){
          self.setState({ text: text });
        })
      },
      render: function(props, state){
        i++;
        return dom('div', null, [props.text, ' ', state.text]);
      }
    });
    var ComponentB = component({
      render: function(props, state){
        i++;
        return dom('div', null, [
          dom(ComponentA, { text: props.text })
        ]);
      }
    });

    var app = scene(ComponentB)
    app.setProps({ text: '2x' })

    mount(app, function(el, rendered){
      i = 0;
        // Mark ComponentA as dirty from a state change
      emitter.emit('data', 'Mirror Shield');
      // Update the top-level props
      app.setProps({ text: '3x' })
      // Update the DOM
      rendered.render()
      assert.equal(i, 2)
      assert.equal(el.innerHTML, "<div><div>3x Mirror Shield</div></div>")
    })
  });

  it('should invalidate itself so it is updated on the next frame anyway', function (done) {
    var Invalidate = component({
      onClick: function(){
        this.invalidate();
      },
      render: function(){
        return dom('span', { onClick: this.onClick });
      },
      afterUpdate: function(){
        done();
      }
    });
    var app = scene(Invalidate)
    mount(app, function(el, rendered){
      trigger(el.querySelector('span'), 'click')
      rendered.render()
    })
  });

  it('should only update if shouldUpdate returns true', function () {
    var i = 0;
    var Component = component({
      afterUpdate(){
        i = i + 1;
      },
      shouldUpdate(){
        return false;
      },
      render(){
        return dom('div')
      }
    });

    var app = scene(Component)
    mount(app, function(el, rendered){
      app.setProps({ foo: 'bar' });
      rendered.render();
      assert.equal(i, 0);
      app.setProps({ foo: 'baz' });
      rendered.render();
      assert.equal(i, 0);
    })
  });

});