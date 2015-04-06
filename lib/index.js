exports.component = require('./component');
exports.dom = require('./virtualize').node;
exports.scene =
exports.world = require('./world');
exports.renderString = require('./renderer/string');

if (typeof window !== 'undefined') {
  exports.render = require('./renderer/dom');
}
