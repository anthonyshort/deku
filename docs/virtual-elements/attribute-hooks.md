# Attribute hooks

When you set an attribute value as a function it will be called and it's value will be used as the attribute value instead. These hooks allow you to modifiy the rendered DOM element. If no value is returned the attribute will be removed.

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

In this case the attribute value is the same every time so it is ignored on later render passes. You can do the same with element updates, but by making it a new function each time.

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
