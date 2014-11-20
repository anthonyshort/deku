var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('attributes', function () {

  it('should update attributes', function(done){
    var Page = component({
      render: function(dom, state, props) {
        return dom('span', { name: props.name });
      },
      afterUpdate: function(){
        assert.equal(el.innerHTML, '<span name="Bob"></span>');
        done();
      }
    });
    var mount = Page.render(el, { name: 'Tom' });
    assert.equal(el.innerHTML, '<span name="Tom"></span>');
    mount.setProps({ name: 'Bob' });
  })

  it('should add attributes', function(done){
    var Page = component({
      render: function(dom, state, props) {
        var attrs = {};
        if (props.name) attrs.name = props.name;
        return dom('span', attrs);
      },
      afterUpdate: function(){
        assert.equal(el.innerHTML, '<span name="Bob"></span>');
        done();
      }
    });
    var mount = Page.render(el);
    assert.equal(el.innerHTML, '<span></span>');
    mount.setProps({ name: 'Bob' });
  })

  it('should remove attributes', function(done){
    var Page = component({
      render: function(dom, state, props) {
        var attrs = {};
        if (props.name) attrs.name = props.name;
        return dom('span', attrs);
      },
      afterUpdate: function(){
        assert.equal(el.innerHTML, '<span></span>');
        done();
      }
    });
    var mount = Page.render(el, { name: 'Bob' });
    assert.equal(el.innerHTML, '<span name="Bob"></span>');
    mount.setProps({ name: null });
  })

  it('should not update attributes that have not changed', function (done) {
    var pass = true;
    var Page = component({
      afterMount: function(el){
        el.setAttribute = function(){
          pass = false;
        }
      },
      render: function(dom, state, props) {
        return dom('div', { name: props.name })
      }
    });
    var mount = Page.render(el, { name: 'Bob' });
    mount.setProps({ name: 'Bob' }, function(){
      assert(pass);
      done();
    });
  })

});