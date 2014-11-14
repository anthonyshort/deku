
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

// component.

require('./component');
require('./component/lifecycle');

// mount.

require('./mount/tree');

// diffing.

require('./diff/structure');
require('./diff/attributes');
require('./diff/text');

