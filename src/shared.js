/**
 * Determine if two virtual nodes are the same type
 */

export let isSameType = (left, right) => {
  return nodeType(left) === nodeType(right) && left.type === right.type
}

/**
 * Get the content for a custom element
 */

export let renderThunk = (customElement, model, context) => {
  let render = customElement.type
  let rootElement = render(model, context)
  return rootElement
}

/**
 * The model is used in the custom element render function.
 */

export let createModel = (virtualElement, context, path) => {
  return {
    attributes: virtualElement.attributes,
    children: virtualElement.children,
    path: path,
    context: context
  }
}

/**
 * Group an array of virtual elements by their key, using index as a fallback.
 */

export let groupByKey = (children) => {
  return children.reduce((acc, child, i) => {
    if (child != null && child !== false) {
      acc.push({
        key: String(getKey(child) || i),
        item: child,
        index: i
      })
    }
    return acc
  }, [])
}

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
