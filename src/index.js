import renderString from './renderString'
import createDOMRenderer from './createDOMRenderer'

if (typeof document !== 'undefined') {
  exports.createDOMRenderer = createDOMRenderer
}

exports.renderString = renderString
