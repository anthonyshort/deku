/**
 * Imports
 */

import {addTodo, setAllCompleted} from './actions/curried'
import combineReducers from '@f/combine-reducers'
import handleActions from '@f/handle-actions'
import createAction from '@f/create-action'
import Footer from './components/footer'
import element from 'virtex-element'
import Todo from './components/todo'

/**
 * initialState
 */

function initialState () {
  return {
    todos: [],
    text: ''
  }
}

/**
 * Render
 */

function render ({props, state, local}) {
  const {url, todos} = props
  const {text} = state
  const numCompleted = todos.reduce((acc, todo) => acc + (todo.completed ? 1 : 0), 0)
  const allDone = numCompleted === todos.length
  const itemsLeft = todos.length - numCompleted
  const activeFilter = url.slice(1).toLowerCase() || 'all'
  const submit = [addTodo(text), local(clearText)]

  return (
    <section class='todoapp'>
      <header class='header'>
        <h1>todos</h1>
        <input
          class='new-todo'
          autofocus
          type='text'
          onInput={local(setText)}
          onKeyDown={{enter: text && submit}}
          value={state.text}
          placeholder='What needs to be done?' />
      </header>
      <section id='main' class='main' style={{display: todos.length ? 'block' : 'none'}}>
        <input class='toggle-all' type='checkbox' onChange={setAllCompleted(!allDone)} checked={allDone} />
        <label for='toggle-all'>
          Mark all as complete
        </label>
        <ul class='todo-list'>
          {
            todos.map((todo, i) => isShown(todo)
                ? <Todo idx={i} {...todo} />
                : null)
          }
        </ul>
      </section>
      {
        todos.length
          ? <Footer itemsLeft={itemsLeft} completed={numCompleted} active={activeFilter} />
          : null
      }
    </section>
  )

  function isShown (todo) {
    switch (activeFilter) {
      case 'completed':
        return todo.completed
      case 'active':
        return !todo.completed
      default:
        return true
    }
  }
}

/**
 * Local actions
 */

const setText = createAction('SET_TEXT', e => e.target.value.trim())
const clearText = createAction('CLEAR_TEXT')

/**
 * Reducer
 */

const reducer = combineReducers({
  text: handleActions({
    [clearText]: () => '',
    [setText]: (state, text) => text
  })
})

/**
 * Exports
 */

export default {
  initialState,
  render,
  reducer
}
