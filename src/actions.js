export const types = {
  CREATE_ELEMENT: 'CREATE_ELEMENT',
  SET_ATTRIBUTE: 'SET_ATTRIBUTE',
  REMOVE_ATTRIBUTE: 'REMOVE_ATTRIBUTE',
  APPEND_CHILD: 'APPEND_CHILD',
  INSERT_CHILD: 'INSERT_CHILD',
  REPLACE_CHILD: 'REPLACE_CHILD',
  REMOVE_CHILD: 'REMOVE_CHILD',
  UPDATE_CHILD: 'UPDATE_CHILD',
  INSERT_BEFORE: 'INSERT_BEFORE',
  CREATE_THUNK: 'CREATE_THUNK',
  UPDATE_THUNK: 'UPDATE_THUNK',
  DESTROY_THUNK: 'DESTROY_THUNK'
}

export function createElement (vnode) {
  return {
    type: types.CREATE_ELEMENT,
    vnode
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

export function insertChild (vnode, path, index) {
  return {
    type: types.INSERT_CHILD,
    vnode,
    path,
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

export function replaceChild (previous, next, path, index) {
  return {
    type: types.REPLACE_CHILD,
    previous,
    next,
    path,
    index
  }
}

export function appendChild (vnode) {
  return {
    type: types.APPEND_CHILD,
    vnode
  }
}

export function createThunk (thunk, path) {
  return {
    type: types.CREATE_THUNK,
    thunk,
    path
  }
}

export function updateThunk (thunk, previousThunk, path, index) {
  return {
    type: types.UPDATE_THUNK,
    thunk,
    previousThunk,
    path,
    index
  }
}

export function destroyThunk (thunk) {
  return {
    type: types.DESTROY_THUNK,
    thunk
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

export function setAttribute (name, value, previousValue) {
  return {
    type: types.SET_ATTRIBUTE,
    name,
    value,
    previousValue
  }
}

export function insertBefore (vnode, position) {
  return {
    type: types.INSERT_BEFORE,
    vnode,
    position
  }
}
