var assert = require('component/assert@0.4.0');
var Emitter = require('component/emitter');
var domify = require('component/domify');
var tick = require('timoxley/next-tick');
var tron = require('../index.js');
var dom = tron.dom;
var component = tron.component;

describe('component', function(){
  var node;
  var el;

  beforeEach(function(){
    node = dom();
    el = domify('<div id="example"></div>');
    document.body.appendChild(el);
  });

  afterEach(function(){
    var el = document.getElementById('example');
    if (el) document.body.removeChild(el);
  });

  describe('create', function(){
    it('should create a component', function(){
      var Page = component(render);
      Page.mount(el);
      assert.equal(el.innerHTML, '<span>Hello World</span>');

      function render(state, props) {
        return dom('span', {}, ['Hello World']);
      }
    });

    it('should create a component with properties', function(){
      var Page = component(render);

      Page.mount(el, {
        one: 'Hello',
        two: 'World'
      });

      assert.equal(el.innerHTML, '<span>Hello World</span>');

      function render(state, props) {
        return dom('span', {}, [props.one + ' ' + props.two]);
      }
    });

    it('should create a component with states', function(){
      var Page = component(render);

      Page.prototype.getInitialState = function(){
        return {
          one: 'Hello',
          two: 'World'
        }
      };

      Page.mount(el);
      assert.equal(el.innerHTML, '<span>Hello World</span>');

      function render(state, props) {
        return dom('span', {}, [state.one + ' ' + state.two]);
      }
    });

    it('should emit `create`', function(done){
      var Page = component(render);
      Page.prototype.oncreate = done;
      Page.mount(el);

      function render(state, props) {
        return dom('span', {}, ['Hello World']);
      }
    });

    it('should emit `created`', function(done){
      var Page = component(render);
      Page.prototype.oncreated = done;
      Page.mount(el);

      function render(state, props) {
        return dom('span', {}, ['Hello World']);
      }
    });
  });

  describe('update', function(){
    it('should change state', function(done){
      var Page = component(render)
        .state('one', 'Hello')
        .state('two', 'World');

      Page.prototype.getInitialState = function() {
        return {
          one: 'Hello',
          two: 'World'
        };
      };

      Page.prototype.oncreated = function(){
        // pretending the user does something here...
        var self = this;
        setTimeout(function(){
          self.set('one', 'Open');
        }, 10);
      };

      Page.prototype.onupdated = function(){
        assert.equal(el.innerHTML, '<div><span>Open</span> <span>World</span></div>');
        done();
      };

      Page.mount(el);

      function render(state, props) {
        return dom('div', {}, [
          dom('span', {}, [ state.one ]),
          ' ',
          dom('span', {}, [ state.two ])
        ]);
      }
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
