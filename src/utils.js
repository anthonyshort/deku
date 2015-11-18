/**
 * Get the key from a virtual element.
 */

export let getKey = (virtualElement) => {
  return virtualElement && virtualElement.attributes && virtualElement.attributes.key
}

/**
 * Get the type of virtual element.
 */

export let nodeType = (element) => {
  switch (typeof element.type) {
    case 'string':
      return 'native'
    case 'function':
      return 'thunk'
    default:
      return 'text'
  }
}

/**
 * Check if an attribute shoudl be rendered into the DOM.
 */

export function isValidAttribute (value) {
  if (typeof value === 'boolean') return value
  if (value === '') return true
  if (value === undefined) return false
  if (value === null) return false
  if (value === false) return false
  return true
}
