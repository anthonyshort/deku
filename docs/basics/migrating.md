# Migrating from v1

There have been a few big changes to the API since version 1. The goal of the changes is to move Deku away from trying to be a kitchen-sink module and instead just do one small thing well.

Here are the major changes:

* `sources` and `.set` API have been removed
* `app` API was removed. You no longer need to create a `tree` and call `.mount` whenever you want to render something different. Instead, you'll create a `render` method, and then just call that with your new virtual element.
* `virtual-element` now exists within Deku and you don't need to depend on it separately. If people want to create 'magical' wrappers that handle attributes in a custom way (e.g. like `class`) they should just create a custom module.
* `setState` has been removed. The reason why we needed something like `app` was because it managed the re-renders for you. Now there's only one way to re-render, and that's to call `render` again. You'll need to store local state on your own using the components `path` property.
* `initialState` has been removed.
* `defaultProps` has been removed.
* `context` has been added.
* Lifecycle hooks have changed.


## Lifecycle Hooks

Having so many hooks before and after events meant that developers would need to start thinking about state over time again, rather than being declarative.

#### Changed
* `beforeMount(model)` -> `onCreate(model)`
* `afterUpdate(prev, next, el)` -> `onUpdate(model)`
* `beforeUnmount(model)` -> `onRemove(model)`

#### Removed
* `afterMount`
* `beforeUpdate`
* `beforeRender`
* `afterRender`

You can see how we don't worry about passing in previous and next data into the hooks. It turns out if you ever needed to do that, there was always a cleaner way to do it.

### How do I...?

You should be able to still do everything you did before, but we don't pass you the DOM element. This was a deliberate choice. It was difficult to get it to work well so that the hook was called at just the right time. Instead, we'd rather not try and make a nice API for something that is inherently imperative and used for hacking at the DOM directly.

This means you'll need to just add a class to the element you want to mutate, then call `querySelector` in the hook to find it. For example, if I wanted to get the element in the `onCreate` hook:

```js
function onCreate ({ path }) {
  requestAnimationFrame(mutate(path))
}

function render ({ path }) {
  return <div id={path}>Hello</div>
}

function mutate (path) {
  return () => {
    let el = document.querySelector('#' + path)
    // perform some side-effects
  }
}

export {
  onCreate,
  render  
}
```

It would be even better to just dispatch an action from `onCreate` and let something else in your app handle it entirely. This is a trivial example, but you can see how it needs to wait until the next frame (so the element exists in the DOM).
