var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('stringify', function(){

  it('should render an element', function () {
    var Component = component({
      render: function(dom, state, props){
        return dom('div');
      }
    });
    var result = Component.renderString();
    assert(result === '<div></div>');
  });

  it('should render an element with attributes', function () {
    var Component = component({
      render: function(dom, state, props){
        return dom('div', { id: 'foo'});
      }
    });
    var result = Component.renderString();
    assert(result === '<div id="foo"></div>');
  });

  it('should render an element with text', function () {
    var Component = component({
      render: function(dom, state, props){
        return dom('div', null, 'foo');
      }
    });
    var result = Component.renderString();
    assert(result === '<div>foo</div>');
  });

  it('should render an element with child elements', function () {
    var Component = component({
      render: function(dom, state, props){
        return dom('div', null, [
          dom('span', null, 'foo')
        ]);
      }
    });
    var result = Component.renderString();
    assert(result === '<div><span>foo</span></div>');
  });

  it('should render an element with child components', function () {
    var Span = component({
      render: function(dom, state, props){
        return dom('span', null, 'foo');
      }
    });
    var Div = component({
      render: function(dom, state, props){
        return dom('div', null, [
          Span()
        ]);
      }
    });
    var result = Div.renderString();
    assert(result === '<div><span>foo</span></div>');
  });

  it('should render an element with component root', function () {
    var Span = component({
      render: function(dom, state, props){
        return dom('span', null, 'foo');
      }
    });
    var Component = component({
      render: function(dom, state, props){
        return dom(Span);
      }
    });
    var result = Component.renderString();
    assert(result === '<span>foo</span>');
  });

});
