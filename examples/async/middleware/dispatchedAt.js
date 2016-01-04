/**
 * Add a dispatchedAt timestamp to all of your redux actions
 */

function dispatchedAt (api) {
  return next => action => next({...action, dispatchedAt: +new Date()})
}

/**
 * Exports
 */

export default dispatchedAt
