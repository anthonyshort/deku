var component = require('deku');

var App = component({
  render: function(dom){
    return dom('div', null, 'Hello World');
  }
});

App.render(document.body);