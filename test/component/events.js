
var trigger = require('adamsanderson/trigger-event');
var assert = require('component/assert@0.4.0');
var component = require('/lib/component');

describe('events', function(){
  it('should add click event', function(){
    var count = 0;
    var Page = component({
      render: function(dom, state, props){
        return dom('span', { onclick: onclick }, ['Hello World']);
      }
    });

    Page.render(el);
    assert.equal(el.innerHTML, '<span>Hello World</span>');
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);

    function onclick() {
      ++count;
    }
  });

  it('should remove click event', function(){
    var count = 0;
    var Page = component({
      render: function(dom, state, props){
        if (props.click) {
          return dom('span', { onclick: onclick }, ['Hello World']);
        } else {
          return dom('span', {}, ['Hello World']);
        }
      }
    });

    var mount = Page.render(el, { click: true });
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);
    mount.set({ click: false });
    trigger(el.querySelector('span'), 'click');
    assert.equal(count, 1);

    function onclick() {
      ++count;
    }
  });
});
