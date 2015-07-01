require('es6-promise').polyfill()
require("babelify/polyfill")

describe('virtual', function(){
  require('./virtual')
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
  require('./dom/statics')
  require('./dom/pool')
  require('./dom/keys')
  require('./dom/hooks')
  require('./dom/svg')
})

describe('String Renderer', function(){
  require('./string')
})
