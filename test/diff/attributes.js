var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('attributes', function () {

  it('should update attributes', function(){
    var Page = component({
      render: function(dom, state, props) {
        return dom('span', { name: props.name });
      }
    });
    var mount = Page.render(el, { name: 'Tom' });
    assert.equal(el.innerHTML, '<span name="Tom"></span>');
    mount.set({ name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob"></span>');
  })

  it('should add attributes', function(){
    var Page = component({
      render: function(dom, state, props) {
        var attrs = {};
        if (props.name) attrs.name = props.name;
        return dom('span', attrs);
      }
    });
    var mount = Page.render(el);
    assert.equal(el.innerHTML, '<span></span>');
    mount.set({ name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob"></span>');
  })

  it('should remove attributes', function(){
    var Page = component({
      render: function(dom, state, props) {
        var attrs = {};
        if (props.name) attrs.name = props.name;
        return dom('span', attrs);
      }
    });
    var mount = Page.render(el, { name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob"></span>');
    mount.set({ name: null });
    assert.equal(el.innerHTML, '<span></span>');
  })

  it('should not update attributes that have not changed', function (done) {
    var Page = component({
      mount: function(el){
        el.setAttribute = function(){
          done(false);
        }
      },
      render: function(dom, state, props) {
        return dom('div', { name: props.name })
      }
    });
    var mount = Page.render(el, { name: 'Bob' });
    mount.set({ name: 'Bob' });
    done();
  })

});