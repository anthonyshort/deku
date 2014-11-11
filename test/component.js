var assert = require('component/assert@0.4.0');
var Emitter = require('component/emitter');
var domify = require('component/domify');
var tick = require('timoxley/next-tick');
var component = require('../index.js');

describe.skip('component', function(){
  var el;

  beforeEach(function(){
    el = domify('<div id="example"></div>');
    document.body.appendChild(el);
  });

  afterEach(function(){
    var el = document.getElementById('example');
    if (el) document.body.removeChild(el);
  });

  describe('create', function(){
    it('should create a component', function(){

      var Page = component({
        render: function(state, props, dom) {
          return dom('span', {}, ['Hello World']);
        }
      });

      Page.mount(el);
      assert.equal(el.innerHTML, '<span>Hello World</span>');
    });

    it('should create a component with properties', function(){
      var Page = component({
        render: function(state, props, dom) {
          return dom('span', {}, [props.one + ' ' + props.two]);
        }
      });

      Page.mount(el, {
        one: 'Hello',
        two: 'World'
      });

      assert.equal(el.innerHTML, '<span>Hello World</span>');
    });

    it('should create a component with states', function(){

      var Page = component({
        initialState: function(){
          return {
            one: 'Hello',
            two: 'World'
          }
        },
        render: function(state, props, dom) {
          return dom('span', {}, [state.one + ' ' + state.two]);
        }
      });

      Page.mount(el);
      assert.equal(el.innerHTML, '<span>Hello World</span>');
    });

  });

  describe('update', function(){
    it('should change state', function(done){

      var Page = component({
        initialState: function(){
          return {
            one: 'Hello',
            two: 'World'
          };
        },
        created: function(state, props) {
          // pretending the user does something here...
          var self = this;
          setTimeout(function(){
            self.set('one', 'Open');
          }, 10);
        },
        updated: function(){
          assert.equal(el.innerHTML, '<div><span>Open</span> <span>World</span></div>');
          done();
        },
        render: function(state, props, dom){
          return dom('div', {}, [
            dom('span', {}, [ state.one ]),
            ' ',
            dom('span', {}, [ state.two ])
          ]);
        }
      });

      Page.mount(el);
    });

    it('should change nested components', function(done){
      var Page1 = component(function(){
        return dom('span', {}, ['Page 1']);
      });

      var Page2 = component(function(){
        return dom('span', {}, ['Page 2']);
      });

      var App = component(function(state, props){
        var current = state.page;
        return dom('div', {}, [
          dom(current, {}, []),
          dom('i', {}, [ 'loaded' ])
        ]);
      });

      App.prototype.getInitialState = function(){
        return {
          page: Page1
        }
      };

      App.prototype.oncreate = function(){
        // when the store changes, re-render
        store.on('change', this.reload);
      };

      App.prototype.reload = function(){
        // just set the apps "page" state to the current page
        this.set('page', store.page);
      };

      App.prototype.oncreated = function(){
        assert.equal(el.innerHTML, '<div><span>Page 1</span><i>loaded</i></div>');
      };

      App.prototype.onupdated = function(){
        assert.equal(el.innerHTML, '<div><span>Page 2</span><i>loaded</i></div>');
        done();
      };

      var store = new Emitter;

      App.mount(el);

      setTimeout(function(){
        store.page = Page2;
        store.emit('change');
      }, 10);
    });
  });
});
