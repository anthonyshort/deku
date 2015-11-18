export function updateThunk (thunk, previousThunk, path) {
  return {
    type: 'updateThunk',
    previousThunk,
    thunk,
    path
  }
}

export function removeAttribute (name, previousValue) {
  return {
    type: 'removeAttribute',
    value: null,
    name,
    previousValue
  }
}

export function addAttribute (name, value) {
  return {
    type: 'addAttribute',
    previousValue: null,
    name,
    value
  }
}

export function updateAttribute (name, value, previousValue) {
  return {
    type: 'updateAttribute',
    name,
    value,
    previousValue
  }
}

export function insertChild (element, index) {
  return {
    type: 'insertChild',
    element,
    index
  }
}

export function updateChild (actions, index) {
  return {
    type: 'updateChild',
    actions,
    index
  }
}

export function moveChild (from, to) {
  return {
    type: 'moveChild',
    from,
    to
  }
}

export function removeChild (element, index) {
  return {
    type: 'removeChild',
    element,
    index
  }
}
