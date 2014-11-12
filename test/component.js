var assert = require('component/assert@0.4.0');
var Emitter = require('component/emitter');
var domify = require('component/domify');
var tick = require('timoxley/next-tick');
var component = require('../index');

describe('component', function(){
  var el;

  function defaultRender(dom, state, props) {
    return dom();
  }

  beforeEach(function(){
    el = domify('<div id="example"></div>');
    document.body.appendChild(el);
  });

  afterEach(function(){
    var el = document.getElementById('example');
    if (el) document.body.removeChild(el);
  });

  it('should create a component', function(){
    var Page = component({
      render: function(dom, state, props) {
        return dom('span', null, ['Hello World']);
      }
    });
    Page.render(el);
    assert.equal(el.innerHTML, '<span>Hello World</span>');
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

  it('should fire the `mount` hook', function (done) {
    var Page = component({
      render: defaultRender,
      mount: function(el){
        assert(el.tagName === 'DIV');
        done();
      }
    });
    Page.render(el);
  })

  it('should fire the `unmount` hook', function (done) {
    var Page = component({
      render: defaultRender,
      unmount: function(){
        done();
      }
    });
    var mount = Page.render(el);
    mount.remove();
  })

  it('should not unmount twice', function () {
    var Page = component({
      render: defaultRender
    });
    var mount = Page.render(el);
    mount.remove();
    mount.remove();
  })

});
