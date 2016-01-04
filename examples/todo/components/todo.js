/**
 * Imports
 */

import {removeTodo, setImportant, setCompleted, setTodoText} from '../actions/curried'
import combineReducers from '@f/combine-reducers'
import handleActions from '@f/handle-actions'
import createAction from '@f/create-action'
import element from 'virtex-element'
import Dropdown from './dropdown'

/**
 * Initial state
 */

function initialState () {
  return {
    editing: false
  }
}

/**
 * Render
 */

function render ({state, props, local, ref}) {
  const {text, important, completed, idx} = props
  const {editing, editText} = state
  const edit = local(beginEdit, text)
  const cancel = local(cancelEdit)
  const submit = editText
    ? [setTodoText(idx, editText), cancel]
    : removeTodo(idx)

  return (
    <li class={{completed, important, editing}}>
      <div class='view' onDblClick={edit}>
        <input class='toggle' type='checkbox' onChange={setCompleted(idx, !completed)} checked={completed} />
        <label style={{color: important ? 'red' : 'black'}}>
          {text}
          <img class='options' src='css/options.png' onClick={ref.to('dropdown', Dropdown.toggle)} />
          <Dropdown ref={ref.as('dropdown')}>
            <div onClick={setImportant(idx, !important)}>Important</div>
            <div onClick={removeTodo(idx)}>Remove</div>
          </Dropdown>
        </label>
      </div>
      <input class='edit'
        focused={editing}
        value={editText}
        onBlur={editing && submit}
        onInput={local(setEditText)}
        onKeyDown={{enter: submit, esc: cancel}} />
    </li>
  )
}

/**
 * Local actions
 */

const beginEdit = createAction('BEGIN_EDIT')
const cancelEdit = createAction('CANCEL_EDIT')
const setEditText = createAction('SET_EDIT_TEXT', e => e.currentTarget.value.trim())

/**
 * Local reducer
 */

const reducer = combineReducers({
  editing: handleActions({
    [beginEdit]: () => true,
    [cancelEdit]: () => false
  }),
  editText: handleActions({
    [beginEdit]: (state, text) => text,
    [setEditText]: (state, text) => text
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
