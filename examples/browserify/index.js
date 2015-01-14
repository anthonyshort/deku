var deku = require('deku');
var component = deku.component;
var dom = deku.dom;

var App = component({
  render: function(){
    return dom('div', null, 'Hello World');
  }
});

App.render(document.body);