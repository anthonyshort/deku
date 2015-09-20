# Validation

You can validate the attributes of the model to make sure anyone using your component is passing in the correct types. You can expose a `validate` function in your components that will be called before every render pass.

```js
export function validate (model, context) {
  // do some validation...
}
```

You can use this to check the model or context to make sure the values are correct. Deku doesn't provide any validation logic, but here's an example using the `validate` module from npm:

```js
import schema from 'validate'

let Model = schema({
  'name': {
    type: 'string',
    required: true
  }
})

export function validate (model) {
  Model.validate(model.attributes)
}

export default function Button (model) {
  return <div>{model.name}</div>
}
```
