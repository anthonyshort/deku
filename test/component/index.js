
var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('component', function(){
  it('should create a component', function(){
    var Page = component({
      render: function(dom, state, props){
        return dom('span', null, ['Hello World']);
      }
    });
    Page.render(el);
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should create a component with just a render function', function () {
    var Page = component(function(dom, state, props){
      return dom('span', null, [props.name]);
    });
    Page.render(el, { name: 'Link' });
    assert.equal(el.innerHTML, '<span>Link</span>');
  });

  it('should bind `this` to any method', function(done){
    var Page = component({
      hack: function(){
        assert(this instanceof Page);
        done();
      },
      render: function(dom, state, props){
        var fn = this.hack;
        fn();
        return dom('span', null, ['Hello World']);
      }
    });
    Page.render(el);
  });

  it('should allow strings as children', function(){
    var Page = component({
      render: function(dom, state, props){
        return dom('span', null, 'Hello World');
      }
    });
    Page.render(el);
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should render nothing visible on the page by default', function(){
    var Page = component();
    Page.render(el);
    assert.equal(el.innerHTML, '<noscript></noscript>');
  });

  it('should create a component with properties', function(){
    var Page = component({
      render: function(dom, state, props){
        return dom('span', null, [props.one + ' ' + props.two]);
      }
    });
    Page.render(el, {
      one: 'Hello',
      two: 'World'
    });
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should not merge new props', function(){
    var Page = component({
      render: function(dom, state, props){
        return dom('span', null, [props.one + ' ' + props.two]);
      }
    });
    var mount = Page.render(el, {
      one: 'Hello',
      two: 'World'
    });
    mount.setProps({ one: 'Hello' });
    mount.forceUpdate();
    assert.equal(el.innerHTML, '<span>Hello undefined</span>');
  });

  it('should render sub-components', function(){
    var ComponentA = component({
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return n(ComponentA, { text: 'foo', name: props.name });
      }
    });
    var mount = ComponentB.render(el, { name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob">foo</span>');
  });

  it('should update sub-components', function(done){
    var ComponentA = component({
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return n(ComponentA, { text: 'foo', name: props.name });
      }
    });
    var mount = ComponentB.render(el, { name: 'Bob' });
    mount.setProps({ name: 'Tom' }, function(){
      assert.equal(el.innerHTML, '<span name="Tom">foo</span>');
      done();
    })
  });

  it('should update sub-components when state changes', function(done){
    var ComponentA = component({
      render: function(n, state, props){
        return n('div', null, [
          ComponentB()
        ]);
      }
    });
    var ComponentB = component({
      initialState: function(){
        return { text: "foo" };
      },
      afterMount: function(){
        this.setState({ text: 'bar' });
      },
      render: function(n, state, props){
        return n('span', null, state.text);
      }
    });
    var mount = ComponentA.render(el);
    requestAnimationFrame(function(){
      assert.equal(el.innerHTML, '<div><span>bar</span></div>');
      done();
    });
  });

  it('should have initial state', function(){
    var ComponentA = component({
      initialState: function(){
        return {
          duration: 0
        }
      },
      render: function(dom, state){
        assert(state.duration === 0);
        return dom();
      }
    });
    ComponentA.render(el);
  });

  it('should throw an error if the render method does not return a node', function(done){
    var ComponentA = component({
      render: function(dom, state){
        return false;
      }
    });
    try {
      ComponentA.render(el);
      done(false);
    } catch (e) {
      done();
    }
  });

  it('should update when the component state changes', function(done){
    var ComponentA = component({
      initialState: function(){
        return {
          duration: 0
        }
      },
      afterMount: function(){
        this.setState({ 'duration': 1 });
      },
      afterUpdate: function(){
        assert(el.innerHTML === '<span>1</span>');
        done();
      },
      render: function(n, state, props){
        return n('span', null, [state.duration]);
      }
    });
    ComponentA.render(el);
  });

  it('should allow optional spec', function(){
    var Page = component();
    Page.prototype.render = function(dom, state, props){
      return dom('span', null, ['Hello World']);
    };
    Page.render(el);
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should override the shouldUpdate method', function (done) {
    var i = 0;
    var Page = component({
      render: function(dom, state, props){
        i++;
        return dom();
      },
      shouldUpdate: function(){
        return false;
      }
    });
    var mount = Page.render(el, { n: 0 });
    mount.setProps({ n: 1 }, function(){
      assert(i === 1);
      done();
    });
  });

  it('should ignore the shouldUpdate method if forceUpdate is used', function () {
    var i = 0;
    var Page = component({
      render: function(dom, state, props){
        i++;
        return dom();
      },
      shouldUpdate: function(){
        return false;
      }
    });
    var mount = Page.render(el, { n: 0 });
    mount.setProps({ n: 1 });
    mount.forceUpdate();
    assert(i === 2);
  });

  it('shouldnt update child when the props haven\'t changed', function (done) {
    var calls = 0;
    var ComponentA = component({
      render: function(n, state, props){
        calls++;
        return n('span', null, [props.text]);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return n('div', { name: props.character }, [
          ComponentA({ text: 'foo' })
        ]);
      }
    });
    var mount = ComponentB.render(el, {
      character: 'Link'
    });
    mount.setProps({ character: 'Zelda' }, function(){
      assert(calls === 1);
      done();
    });
  });

  it('should compose without needing to use dom object', function () {
    var ComponentA = component({
      render: function(n, state, props){
        return n('span', { name: props.name }, [props.text]);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return ComponentA({ text: 'foo', name: props.name });
      }
    });
    var mount = ComponentB.render(el, { name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob">foo</span>');
  });

  it('should not call flush callbacks if removed', function (done) {
    var Component = component(function(dom, state, props){
      return dom('div', null, props.text);
    });
    var mount = Component.render(el, { text: 'foo' });
    mount.setProps({ text: 'bar' }, function(){
      done(false); // the callback should never be called
    });
    mount.remove();
    requestAnimationFrame(function(){
      done();
    });
  });

  it('should not try to update if it is removed', function (done) {
    var Component = component(function(dom, state, props){
      return dom('div', null, props.text);
    });
    var mount = Component.render(el, { text: 'foo' });
    try {
      mount.setProps({ text: 'bar' });
      mount.remove();
      requestAnimationFrame(function(){
        done();
      });
    }
    catch (e) {
      done(false);
    }
  });

  it('should allow components to have child nodes', function () {
    var ComponentA = component({
      render: function(n, state, props){
        return n('div', null, props.children);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return ComponentA(null, [
          n('span', null, 'Hello World!')
        ]);
      }
    });
    var mount = ComponentB.render(el);
    assert.equal(el.innerHTML, '<div><span>Hello World!</span></div>');
  });

  it('should update component child nodes', function (done) {
    var ComponentA = component({
      render: function(n, state, props){
        return n('div', null, props.children);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return ComponentA(null, [
          n('span', null, props.text)
        ]);
      }
    });
    var mount = ComponentB.render(el, { text: 'Hello World!' });
    mount.setProps({
      text: 'Hello Pluto!'
    }, function(){
      assert.equal(el.innerHTML, '<div><span>Hello Pluto!</span></div>');
      done();
    });
  });

  it('should allow components to have other components as child nodes', function () {
    var ComponentA = component({
      render: function(n, state, props){
        return n('div', { name: 'ComponentA' }, props.children);
      }
    });
    var ComponentC = component({
      render: function(n, state, props){
        return n('div', { name: 'ComponentC' }, props.children);
      }
    });
    var ComponentB = component({
      render: function(n, state, props){
        return n('div', { name: 'ComponentB' }, [
          ComponentA(null, [
            ComponentC({ text: props.text }, [
              n('span', null, 'Hello Pluto!')
            ])
          ])
        ]);
      }
    });
    var mount = ComponentB.render(el, { text: 'Hello World!' });
    assert.equal(el.innerHTML, '<div name="ComponentB"><div name="ComponentA"><div name="ComponentC"><span>Hello Pluto!</span></div></div></div>');
  });

});
