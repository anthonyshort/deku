# Browserify Hot Module Replacement

Being purely functional, Hot Module Replacement (HMR), i.e. code swapping at runtime, comes with virtually no cost while using **deku**.

As an alternative to [HMR using webpack](hmr.md), you can use [browserify-hmr] with Browserify as well.

### Install dependencies

We'll use [watchify] to watch for code changes.

```sh
npm install --save-dev browserify-hmr watchify
```

[watchify]: https://github.com/substack/watchify

### Set up HMR hooks

Use the HMR API's `module.hot.accept()` to re-run `render()` when code updates happen.

```js
// The root deku component.
let App = require('./components/app')

// The deku renderer.
let store = createStore(/* ... */)
let render = createRenderer(document.body, store.dispatch)

// Running this will refresh your page with the latest
// components and the latest state.
function update () {
  render(<App />, store.getState())
}

update()

// This is the important part. It will re-render in place
// after updating your code.
if (module.hot) {
  module.hot.accept('./components/app', function () {
    App = require('./components/app')
    update()
  }
}
```

[browserify-hmr]: https://github.com/AgentME/browserify-hmr

### Run watchify

Use watchify with `-p browserify-hmr` to enable hot module replacement.

```sh
# compile your entry point `index.js` into `public/application.js`
watchify -p browserify-hmr index.js -o public/application.js
```
