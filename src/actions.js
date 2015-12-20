export const types = {
  SET_ATTRIBUTE: 'SET_ATTRIBUTE',
  REMOVE_ATTRIBUTE: 'REMOVE_ATTRIBUTE',
  INSERT_CHILD: 'INSERT_CHILD',
  REPLACE_CHILD: 'REPLACE_CHILD',
  REMOVE_CHILD: 'REMOVE_CHILD',
  UPDATE_CHILD: 'UPDATE_CHILD',
  INSERT_BEFORE: 'INSERT_BEFORE'
}

export function setAttribute (name, value, previousValue) {
  return {
    type: types.SET_ATTRIBUTE,
    name,
    value,
    previousValue
  }
}

export function removeAttribute (name, previousValue) {
  return {
    type: types.REMOVE_ATTRIBUTE,
    value: null,
    name,
    previousValue
  }
}

export function insertChild (vnode, index) {
  return {
    type: types.INSERT_CHILD,
    vnode,
    index
  }
}

export function replaceChild (previous, next, index) {
  return {
    type: types.REPLACE_CHILD,
    previous,
    next,
    index
  }
}

export function removeChild (vnode, index) {
  return {
    type: types.REMOVE_CHILD,
    vnode,
    index
  }
}

export function updateChild (vnode, index, actions) {
  return {
    type: types.UPDATE_CHILD,
    vnode,
    index,
    actions
  }
}

export function insertBefore (vnode, index) {
  return {
    type: types.INSERT_BEFORE,
    vnode,
    index
  }
}
