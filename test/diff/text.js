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

  it('should swap elements with text elements', function(done){
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

  it('should add text elements', function(){
    var a = dom('div');
    console.log(a);
    var b = dom('div', null, ['foo']);
    console.log(b);
    var el = a.toElement();
    console.log(el);
    var patch = diff(a,b);
    assert(el.childNodes.length === 0);
    patch(el);
    assert(el.childNodes[0].data === 'foo');
  });

  it('should remove text elements', function(){
    var a = dom('div');
    var b = dom('div', null, ['foo']);
    var el = b.toElement();
    var patch = diff(b, a);
    assert(el.childNodes.length === 1);
    patch(el);
    assert(el.innerHTML === '');
  });

});
