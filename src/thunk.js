/**
 * Get the content for a custom element
 */

export let renderThunk = ({ render, model }) => {
  return render(model)
}

export let createModel = ({ attributes, children }, context, path) => {
  return {
    attributes,
    children,
    context,
    path
  }
}
