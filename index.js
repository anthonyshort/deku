var VirtualElement = require('./lib/element');
var VirtualNode = require('./lib/node');

module.exports = function(type, attrs, children) {
  var element = new VirtualElement(type, attrs);
  var node = new VirtualNode(element, children);
  return node;
}