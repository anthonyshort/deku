exports.component = require('./component');
exports.dom = require('virtualize').node;
exports.scene = require('./scene');
exports.renderString = require('./renderer/string');

if (typeof window !== 'undefined') {
  exports.render = require('./renderer/html');
}
