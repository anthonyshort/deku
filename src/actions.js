export function updateThunk (thunk, previousThunk, path) {
  return {
    type: 'updateThunk',
    previousThunk,
    thunk,
    path
  }
}

export function updateText (value, previousValue) {
  return {
    type: 'updateText',
    value,
    previousValue
  }
}

export function removeAttribute (name, previousValue) {
  return {
    type: 'removeAttribute',
    name,
    previousValue
  }
}

export function addAttribute (name, value) {
  return {
    type: 'addAttribute',
    name,
    value
  }
}

export function updateAttribute (name, value) {
  return {
    type: 'updateAttribute',
    name,
    value
  }
}

export function insertChild (element, index) {
  return {
    type: 'insertChild',
    element,
    index
  }
}
