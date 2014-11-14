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

  it('should update sub-components', function(){

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
    mount.set({ name: 'Tom' })
    assert.equal(el.innerHTML, '<span name="Tom">foo</span>');
  });

});
