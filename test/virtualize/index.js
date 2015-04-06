mocha.setup({ globals: ['hasCert'] });

describe('Virtual DOM', function(){
  require('./node');
  require('./tree');
});
