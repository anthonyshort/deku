var assert = require('component/assert@0.4.0');
var domify = require('component/domify');
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

  it('should create a component', function(){
    var Page = component(render);

    function render(state, props) {
      return dom('span', 'Hello World');
    }

    dom.mount(Page, {}, el);
    // assert.equal('<span>Hello World</span>', el.innerHTML)
  });

  it('should create a component with states', function(){
    var Page = component(render)
      .state('one', 'Hello')
      .state('two', 'World');

    dom.mount(Page, {}, el);

    function render(state, props) {
      return dom('span', state.one + ' ' + state.two);
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

    function render(state, props) {
      return dom('span', props.one + ' ' + props.two);
    }
  });
});
