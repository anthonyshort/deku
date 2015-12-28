/** @jsx element */
import { dom, element } from '../../src'
import App from './app'

let update = state => {
  render(<App {...state} />)
}

let dispatch = action => {
  update(App.update(state, action))
}

let render = dom(
  document.querySelector('main'),
  dispatch
)

let state = App.init()
update(state, App)
