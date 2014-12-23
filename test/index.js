
// create a container.

beforeEach(function(){
  window.el = document.createElement('div');
  window.el.id = "example";
  document.body.appendChild(window.el);
});

afterEach(function(){
  if (window.el) document.body.removeChild(window.el);
});

// tests.

require('./virtual/index');
require('./virtual/tree');

// component.

require('./component');
require('./component/batched');
require('./component/lifecycle');
require('./component/events');
require('./component/stringify');

// diffing.

require('./diff/structure');
require('./diff/attributes');
require('./diff/text');
