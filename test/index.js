
// create a container.

beforeEach(function(){
  window.el = document.createElement('div');
  window.el.id = "example";
  document.body.appendChild(window.el);
})

afterEach(function(){
  if (window.el) document.body.removeChild(window.el);
})

// tests.

require('./node');
require('./tree');

// component.

require('./component');
require('./component/lifecycle');

// diffing.

require('./diff/structure');
require('./diff/attributes');
require('./diff/component');
require('./diff/text');

