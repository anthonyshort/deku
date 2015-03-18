
var trigger = require('trigger-event');
var Emitter = require('component-emitter');
var raf = require('component-raf');
var assert = require('assert');

var deku = require('../../');
var component = deku.component;
var scene = deku.scene;
var dom = deku.dom;

var helpers = require('../helpers');
var mount = helpers.mount;
var HelloWorld = helpers.HelloWorld;

describe('API', function(){

  it.only('should render a component', function(){
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

  it('should render nothing visible on the page by default', function(){
    var Blank = component();
    mount(scene(Blank), function(el){
      assert.equal(el.innerHTML, '<noscript></noscript>');
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
    mount(scene(Page), function(el){
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
    this.scene = Page.render(el);
    this.scene.update();
  });

  it('should create a component with properties', function(){
    var Test = component(Span);
    this.scene = Test.render(el, { text: 'Hello World' });
    this.scene.update();
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should compose without needing to use dom object', function () {
    var Inner = component(Span);
    var Test = component({
      render: function(props, state){
        return Inner({ text: 'foo' });
      }
    });
    this.scene = Test.render(el);
    this.scene.update();
    assert.equal(el.innerHTML, '<span>foo</span>');
  });

  it('should remove from the DOM', function () {
    var Test = component(HelloWorld);
    var scene = Test.render(el);
    scene.update();
    scene.remove();
    assert.equal(el.innerHTML, '');
  });

  it('should not call flush callbacks if removed', function (done) {
    var Test = component(Span);
    var scene = Test.render(el, { text: 'foo' });
    scene.update();
    scene.setProps({ text: 'bar' }, function(){
      throw new Error('Oops');
    });
    scene.remove();
    raf(function(){
      done();
    });
  });

  it('should compose components', function(){
    var Inner = component(HelloWorld);
    var Composed = component({
      render: function(props, state){
        return dom(Inner);
      }
    });
    this.scene = Composed.render(el);
    this.scene.update();
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should compose components and pass in props', function(){
    var Inner = component(TwoWords);
    var Composed = component(function(props, state){
      return dom(Inner, { one: 'Hello', two: 'World' });
    });
    this.scene = Composed.render(el);
    this.scene.update();
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should update sub-components', function(){
    var Inner = component(TwoWords);
    var Composed = component(function(props, state){
      return dom('div', null, [
        dom(Inner, { one: 'Hello', two: props.world })
      ]);
    });
    this.scene = Composed.render(el, { world: 'Earth' });
    this.scene.update();
    this.scene.setProps({ world: 'Pluto' });
    this.scene.update();
    assert.equal(el.innerHTML, '<div><span>Hello Pluto</span></div>');
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
    var scene = ComponentB.render(el);
    scene.update();
    assert.equal(el.innerHTML, '<div><span>Hello World!</span></div>');
    scene.remove();
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
    this.scene = ComponentB.render(el, { text: 'Hello World!' });
    this.scene.update();
    this.scene.setProps({ text: 'Hello Pluto!' });
    this.scene.update();
    assert.equal(el.innerHTML, '<div><span>Hello Pluto!</span></div>');
    this.scene.remove();
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
    this.scene = ComponentB.render(el, { text: 'Hello World!' });
    this.scene.update();
    assert.equal(el.innerHTML, '<div name="ComponentB"><div name="ComponentA"><div name="ComponentC"><span>Hello Pluto!</span></div></div></div>');
  });

  it('should only update components once when state and props change', function(){
    var i = 0;
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
    this.scene = ComponentB.render(el, { text: '2x' });
    this.scene.update();
    i = 0;

    // Mark ComponentA as dirty from a state change
    emitter.emit('data', 'Mirror Shield');

    // Mark ComponentB as dirty
    this.scene.setProps({ text: '3x' });
    this.scene.update();
    assert.equal(i, 2);
    assert.equal(el.innerHTML, "<div><div>3x Mirror Shield</div></div>");
    this.scene.remove();
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
    this.scene = Invalidate.render(el);
    this.scene.update();
    trigger(el.querySelector('span'), 'click');
    this.scene.update();
    this.scene.remove();
  });

  it('should only update if shouldUpdate returns true', function () {
    var i = 0;
    var Component = component({
      afterUpdate: function(){
        i = i + 1;
      },
      shouldUpdate: function(){
        return false;
      }
    });
    var scene = Component.render(el);
    scene.setProps({ foo: 'bar' });
    scene.update();
    assert.equal(i, 0);
    scene.setProps({ foo: 'baz' });
    scene.update();
    assert.equal(i, 0);
  });

});