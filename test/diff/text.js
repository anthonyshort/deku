var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('text', function(){

  it('should update text nodes', function(){
    var Page = component({
      render: function(dom, state, props) {
        return dom('span', null, [props.one + ' ' + props.two]);
      }
    });
    var mount = Page.render(el, {
      one: 'Hello',
      two: 'World'
    });
    mount.set({
      two: 'Pluto'
    });
    assert.equal(el.innerHTML, '<span>Hello Pluto</span>');
  });

  it('should add text elements', function(){
    var i = 0;
    var Page = component({
      mount: function(el){
        if (i === 0) {
          assert(el.outerHTML === '<div></div>');
        } else {
          assert(el.outerHTML === '<div>bar</div>');
        }
      },
      render: function(dom) {
        if (i === 0) return dom('div');
        return dom('div', null, ['bar'])
      }
    });
    var mount = Page.render(el);
    i = 1;
    mount.render();
  });

  it('should remove text elements', function(){
    var i = 0;
    var Page = component({
      mount: function(el){
        if (i !== 0) {
          assert(el.outerHTML === '<div></div>');
        } else {
          assert(el.outerHTML === '<div>bar</div>');
        }
      },
      render: function(dom) {
        if (i !== 0) return dom('div');
        return dom('div', null, ['bar'])
      }
    });
    var mount = Page.render(el);
    i = 1;
    mount.render();
  });

  it('should swap elements with text elements', function(){
    var i = 0;
    var Page = component({
      mount: function(el){
        if (i === 0) {
          assert(el.innerHTML === '<span></span>');
        } else {
          assert(el.innerHTML === 'bar');
        }
      },
      render: function(dom) {
        if (i === 0) return dom('div', null, [dom('span')])
        return dom('div', null, ['bar'])
      }
    });
    var mount = Page.render(el);
    i = 1;
    mount.render();
  });

  it('should swap text elements with elements', function(){
    var i = 0;
    var Page = component({
      mount: function(el){
        if (i !== 0) {
          assert(el.innerHTML === '<span></span>');
        } else {
          assert(el.innerHTML === 'bar');
        }
      },
      render: function(dom) {
        if (i !== 0) return dom('div', null, [dom('span')])
        return dom('div', null, ['bar'])
      }
    });
    var mount = Page.render(el);
    i = 1;
    mount.render();
  });

});
