var Virtual = require('./lib/element');

module.exports = function(type, attrs, children) {
  return new Virtual(type, attrs, children);
}