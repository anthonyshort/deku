var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('component', function(){

  it('should create a component', function(){
    var Page = component({
      render: function(dom, state, props) {
        return dom('span', null, ['Hello World']);
      }
    });
    Page.render(el);
    assert.equal(el.innerHTML, '<span>Hello World</span>');
  });

  it('should allow strings as children', function(){
    var Page = component({
      render: function(dom, state, props) {
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
      render: function(dom, state, props) {
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
      render: function(dom, state, props) {
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

  it('should throw an error if the render method does not return a node', function (done) {
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
});
