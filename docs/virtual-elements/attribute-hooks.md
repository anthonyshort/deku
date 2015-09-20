# Attribute hooks

Attribute hooks allow you to hook into the rendered DOM element. Whatever value is return is set on the element. So if you return a string, that will be the rendered value in the DOM. However, if you return nothing, no attribute will be rendered.

```js
function App (model) {
  return <div doSomething={someHook} />
}

function someHook (el, name, previousValue) {
  el.style.color = 'red'
}
```

Hooks can be used for a number of things:

* Adding custom event listeners
* Calling a function when an element is created or updated
* Animations
* Setting or getting a special property of the element

When rendering, Deku will only call the function if it is different from the last value. The same way it only updates the attribute value if it's actually changed. This means you can use it to call a function when an element is created.


```js
function App (model) {
  return <div onCreate={onCreate} />
}

function onCreate (el) {
  el.style.color = 'red'
}
```

Each render, that attribute value will point to the same function, so it will only ever be called once. You can do the same with element updates, but by making it a new function each time.

```js
function App (model) {
  function onUpdate (el) {
    el.style.color = 'red'
  }
  return <div onUpdate={onUpdate} />
}
```

These attribute hooks work for any attribute, even regular HTML attributes:

```js
function App (model) {
  return <div style={getStyles} />
}

function getStyles (el) {
  return 'color: red'
}
```
