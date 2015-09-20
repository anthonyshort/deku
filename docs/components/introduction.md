# Components

You can define your own custom elements called **components**. Components are pure functions that are given a `model` and return virtual elements. Unlike React, components in Deku are completely stateless, there's no `setState` function or `this` used. They are useful when you want to be able to hook into the lifecycle of a UI component to perform some action when it is added or removed. They are also used to improve rendering performance because we can skip

Here's an example `App` component that renders a paragraph:

```js
import h from 'virtual-element'
import {render} from 'deku'

function App (model, context) {
  return <p color={model.attributes.color}>Hello World</p>
}

render(document.body, <App color="red" />)
```
