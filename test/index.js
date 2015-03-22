// require('./component/helpers');

describe('component', function(){
  require('./component')
})

describe('DOM Renderer', function () {
  require('./component/render-hook');
  require('./component/mount-hook')
  require('./component/update-hook')
  require('./component/props');
  // require('./component/hook-events');
  // require('./component/update-elements');
  // require('./component/update-text');
  // require('./component/update-attributes');
  // require('./component/update-replace');
  // require('./component/events');
  require('./component/state');
});

describe('String Renderer', function () {
  require('./component/string')
});

