var assert = require('component/assert@0.4.0');
var domify = require('component/domify');
var tick = require('timoxley/next-tick');
var dom = require('../index.js');
var component = dom.component;

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
      dom.mount(Page, {}, el);
      assert.equal(el.innerHTML, '<span>Hello World</span>');

      function render(state, props) {
        return dom('span', {}, ['Hello World']);
      }
    });

    it('should create a component with properties', function(){
      var Page = component(render)
        .prop('one')
        .prop('two');

      dom.mount(Page, {
        one: 'Hello',
        two: 'World'
      }, el);
      assert.equal(el.innerHTML, '<span>Hello World</span>');

      function render(state, props) {
        return dom('span', {}, [props.one + ' ' + props.two]);
      }
    });

    it('should create a component with states', function(){
      var Page = component(render)
        .state('one', 'Hello')
        .state('two', 'World');

      dom.mount(Page, {}, el);
      assert.equal(el.innerHTML, '<span>Hello World</span>');

      function render(state, props) {
        return dom('span', {}, [state.one + ' ' + state.two]);
      }
    });

    it('should emit `create`', function(done){
      var Page = component(render);
      Page.prototype.oncreate = done;
      dom.mount(Page, {}, el);

      function render(state, props) {
        return dom('span', {}, ['Hello World']);
      }
    });

    it('should emit `created`', function(done){
      var Page = component(render);
      Page.prototype.oncreated = done;
      dom.mount(Page, {}, el);

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

      Page.prototype.oncreated = function(){
        // pretending the user does something here...
        this.set('one', 'Open');
      }

      Page.prototype.onupdated = function(){
        // TODO: apply the patch!
        // assert.equal(el.innerHTML, '<span>Open World</span>');
        done();
      };

      dom.mount(Page, {}, el);

      function render(state, props) {
        return dom('span', {}, [state.one + ' ' + state.two]);
      }
    });
  });
});
