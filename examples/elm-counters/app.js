/** @jsx element */
import Type from 'union-type'
import {element} from '../../src'
import Counter from './counter'

let Action = Type({
  Add: [],
  Remove: [Number]
})

function init () {
  return {
    counters: []
  }
}

function render ({ props }) {
  return (
    <div>
      {props.counters.map(attrs => <Counter {...attrs} />)}
    </div>
  )
}

function update (state, action) {
  return Action.case({
    Add: () => ({
      ...state,
      counters: state.counters
        .splice()
        .push(Counter.init())
    }),
    Remove: (index) => ({
      ...state,
      counters: state.counters
        .slice()
        .splice(index, 1)
    })
  }, action)
}

export {
  init,
  render,
  update,
  Action
}
