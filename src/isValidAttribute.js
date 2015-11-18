/**
 * Check if an attribute shoudl be rendered into the DOM.
 */

export default function isValidAttribute (value) {
  if (typeof value === 'boolean') return value
  if (value === '') return true
  if (value === undefined) return false
  if (value === null) return false
  if (value === false) return false
  return true
}
