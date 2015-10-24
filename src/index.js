import {renderString} from './server'
import {createRenderer} from './client'

if (typeof document !== 'undefined') {
  exports.createRenderer = createRenderer
}

exports.renderString = renderString
