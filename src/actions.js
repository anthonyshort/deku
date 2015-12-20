import Type from 'union-type'
let Any = () => true

let actions = Type({
  setAttribute: [String, Any, Any],
  removeAttribute: [String, Any],
  insertChild: [Any, Number],
  replaceChild: [Any, Any, Number],
  removeChild: [Any, Number],
  updateChild: [Number, Array],
  insertBefore: [Number]
})

export default actions
