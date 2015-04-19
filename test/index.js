
describe('virtual', function(){
  require('./virtual')
  // require('./virtual/jsx')
});

describe('DOM Renderer', function(){
  require('./dom')
  require('./dom/mount-hook')
  require('./dom/update-hook')
  require('./dom/props')
  require('./dom/elements')
  require('./dom/text')
  require('./dom/attributes')
  require('./dom/replace')
  require('./dom/events')
  require('./dom/state')
  require('./dom/pool')
  require('./dom/data')
})

describe('String Renderer', function(){
  require('./string')
})