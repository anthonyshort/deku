
describe('component', function(){
  require('./component')
})

describe('render', function () {
  require('./dom')
  require('./dom/render-hook');
  require('./dom/mount-hook')
  require('./dom/update-hook')
  require('./dom/props');
  require('./dom/props');
  require('./dom/update-elements');
  require('./dom/update-text');
  require('./dom/update-attributes');
  require('./dom/update-replace');
  require('./dom/events');
  require('./dom/state');
});

describe('renderString', function () {
  require('./string')
});

