// require('./component/helpers');

describe('component', function(){
  require('./component')
})

describe('render', function () {
  require('./component/render-hook');
});

describe('beforeMount/afterMount', function () {
  require('./component/mount-hook')
})

describe('beforeUpdate/afterUpdate', function(){
  require('./component/update-hook')
})

// require('./component/hook-events');
// require('./component/props');
// require('./component/state');
// require('./component/update-elements');
// require('./component/update-text');
// require('./component/update-attributes');
// require('./component/update-replace');
// require('./component/events');
// require('./component/string');