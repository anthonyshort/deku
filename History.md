
0.4.11 / 2015-07-17
==================

 * Fixed deprecation warnings
 * Updated history

0.4.10 / 2015-07-16
==================

 * Added validate hook
 * Attach events to document instead of document.body
 * added ability to cancel events
 * Possibility to pass `false` as well as `null` in component children
 * Remove prop validation
 * Added deprecation warnings for magic class and style transformations.
 * No longer flattening children in virtual nodes
 * Faster SVG element lookups

0.4.9 / 2015-07-07
==================

 * Merge pull request #191 from timmak/svg-missing-animate
 * Add animate to svg list

0.4.8 / 2015-07-01
==================

 * Merge branch 'master' of ssh://github.com/dekujs/deku
 * Merge pull request #188 from xdissent/fix-remove-null-el
 * Handle null element in isElement(). fixes #180

0.4.7 / 2015-07-01
==================

 * Not pooling select elements

0.4.6 / 2015-06-29
==================

 * Merge pull request #187 from dekujs/should-render
 * Fixed: State not committed during shouldUpdate
 * Merge pull request #177 from mpal9000/patch-1
 * docs - initialState props

0.4.5 / 2015-06-13
==================

 * We made it smaller!
 * Merge pull request #173 from foray1010/master
 * Added wheel event
 * Update README.md
 * Update README.md
 * Merge pull request #166 from xdissent/patch-1
 * Merge pull request #167 from DylanPiercey/patch-1
 * Update jsx.md
 * Update events link in README

0.4.4 / 2015-06-05
==================

 * Added `createElement` alias for `element`
 * Update components.md
 * Updated changelog

0.4.3 / 2015-06-04
==================

 * Remove event throttling. Fixes #159
 * added keypress event
 * Fixed issue with rendering event handlers when using renderString

0.4.2 / 2015-05-28
==================

 * fixed event handling so events bubble to parent handlers

0.4.1 / 2015-05-26
==================

 * propTypes validation - support for array of types, type as function

0.4.0 / 2015-05-22
==================

 * Fixed: Fixed issue with components rendered as root nodes. 
 * New: initialState now takes the props as a param
 * New: afterMount, afterRender and event handlers can now return a promise. This means you can use ES7 async functions to have pure lifecycle functions too.
 * New: You can nest propTypes now. Just set the `type` field to be another propTypes object.
 * Fixed: `afterRender` and `afterMount` are now called when the element is in the DOM.
 * Updated: Added phantomjs to the dev deps

0.3.3 / 2015-05-22
==================

 * Added mouseenter/mouseleave
 * Merge pull request #137 from Frikki/issue-134/modular-fastjs
 *  Replaced fast.js require with modular requirement.

0.3.2 / 2015-05-20
==================



0.3.1 / 2015-05-21
==================

  * fixed error with swapping component using sources

0.3.0 / 2015-05-18
==================

 * Added: warnings and nicer error messages
 * Added: Always emptying the container when rendering
 * Added: Deku.d.ts file
 * Removed: the `defaultX` attributes from checkboxes, selects and inputs
 * Fixed: rendering for `checked`, `selected` and `disabled` attributes
 * Fixed: multiple components depending on the same `source`

0.2.17 / 2015-05-11
==================

 * set sources on update

0.2.16 / 2015-05-11
==================

 * Using a different component object each render
 * Cleaned up tests and build
 * Calling .set will always trigger an update instead of checking equality with the previous data value.
 * Added React comparison examples
 * Fixed bug where handler references weren't removed
 * Skip rendering if element is the same

0.2.15 / 2015-05-04
==================

 * add svg support
 * Throw errors for empty types on elements

0.2.14 / 2015-05-03
==================

 * Using fast.js
 * Added some simple examples

0.2.13 / 2015-04-30
==================

 * Added workaround for diffChildren bug

0.2.12 / 2015-04-29
==================

 * Merge pull request #83 from segmentio/fix/child-key-diffing
 * Removed key diffing for elements
 * Passing tests for the keys with events
 * Tests passing with janky first version
 * Added failing test
 * Only flatten children one level deep

0.2.11 / 2015-04-29
==================

 * Added test for virtual node indexes
 * Correctly casting key to a string

0.2.10 / 2015-04-29
==================

 * Improved performance by removing 'omit'
 * IE10 fix
 * Running all tests
 * Added tests for components with keys
 * Coercing keys to strings
 * Code style

0.2.9 / 2015-04-28
==================

 * Passing tests
 * The patch returns the updated element
 * Code style
 * Removing elements first when diffing
 * Cleaned up the key diffing

0.2.8 / 2015-04-28
==================

 * Fixed more issues with falsy keys

0.2.7 / 2015-04-28
==================

 * Fixed falsy keys

0.2.6 / 2015-04-28
==================

 * Fixed incorrect path

0.2.5 / 2015-04-28
==================

 * Avoid touching elements that haven't moved
 * Added test for adding nodes with new keys

0.2.4 / 2015-04-28
==================

 * Fixed bug with creating new nodes in the diff

0.2.3 / 2015-04-27
==================

 * Fixed issue with initial mount

0.2.2 / 2015-04-27
==================

 * Merge branch 'docs'
 * Updated docs
 * Removed old docs and examples
 * Allowing easier initial mounting
 * Adding docs

0.2.1 / 2015-04-25
==================

 * Fixed bug with diffing keyed nodes

0.2.0 / 2015-04-25
==================

 * Updated the hook API
 * Removed defaults

0.1.1 / 2015-04-22
==================

 * Replaced lodash and removed unused modules

0.1.0 / 2015-04-21
==================

Breaking
 * Updated the top-level API. It now mounts virtual nodes instead of components directly.
 * Removed the `component()` DSL. Components are just objects now with no concept of `this`. This is one step towards making hook functions pure.
 * There is no more `this` in any of the functions used in a component. Instead of `this.setState`, the last argument to the function is `setState`, or `send` (think of it as sending changes to the UI).
 * Removed tagName parsing (eg. `dom('div.foo')`) as it was slowing things down

New Features
 * Added key diffing using the `key` attribute on virtual nodes
 * Added optional prop validation via `propTypes`
 * Added defaultProps hook to components
 * Added the ability for components to access data on the app. This makes it easy to side-load data.

Fixes
 * Fixed bug with inputs/textarea being pooled incorrectly
 * Merge pull request #72 from segmentio/attr-modification-bug
 * Fixed a bug in the renderer for falsy attributes
 * Numerous speed improvements
 * Fixed bug with string renderer not calling `beforeMount`
 * Removed the raf loop and just batches

0.0.33 / 2015-04-02
==================

 * Fixed bug with nested components not being unmounted
 * Added test for nested components disabling pooling

0.0.32 / 2015-04-01
==================

 * dom: Fixed disablePooling flag for nested components

0.0.31 / 2015-04-01
==================

 * dom: Tests for scene removal
 * dom: Cleaned up removing of elements

0.0.30 / 2015-03-27
==================

 * Added DOM pooling

0.0.29 / 2015-03-24
==================

 * Breaking change: Updated the scene/renderer API to allow for more powerful plugins. The Component API is now decoupled from the renderer. 
 * Tests now using ES6
 * Fixed beforeMount not firing with renderString
 * Fixed innerHTML rendering with renderString

0.0.28 / 2015-03-11
==================

 * Interactions bind to the body
 * Update component#render() to throw if container is empty
 * Fixed tests in IE9. Fixed SauceLab tests.
 * Removed all the crap from the repo

0.0.27 / 2015-02-26
==================

 * Fixed bug with re-rendering child nodes

0.0.26 / 2015-02-26
==================

* The renderer now renders the entire tree whenever it is dirty and no longer performs shallow equality checks to determine if a component should update. This means that when a component changes, the entire tree below it is re-rendered, including all nested components. This helps to prevent annoying bugs with objects changing and the UI not updating.
* The scene continues to update on every frame, but will still only actually render a component in the tree has changed.
* There is a new shouldUpdate hook available to components to optimize this. You can stop it from re-rendering a component by returning false from this method.
* Removed channels from the API. This was an experimental API and it turned out to be the wrong abstraction when using it in practice. It was making the library responsible for more than it should be.
* The entities now don't know about the scene at all, making them completely decoupled from it.
* The HTMLRenderer now keeps track of the entity state and structure. This allows the entity to become a wrapper around the user component and only provide managing the state/props from the component.
* The scene will now pause when there is an error during rendering to prevent endless errors.
* The scene methods no longer return a promise. It was never used in practice because the top level components are never used in flow control.
* The diff is now slightly more decoupled, which will allow it to be extracted from deku.
* Removed some unused dependencies. This should make the whole library smaller.
* The logic around commiting changes to props/state in the entity has been reworked. It's now much simpler and less prone to bugs.


0.0.25 / 2015-02-22
==================

 * JSX support

0.0.24 / 2015-02-11
==================

 * Added failing test for nested events
 * added hasFunction to fix #47
 * added failing test to demo function diffing

0.0.23 / 2015-02-09
==================

 * Added innerHTML support
 * Fixed drag and drop test event
 * Added test for #47

0.0.22 / 2015-02-03
==================

 * Pulled virtual DOM lib out

0.0.21 / 2015-02-03
==================

 * Added ability to render component at the root

0.0.20 / 2015-01-29
==================

 * Value attribute gets a special case in the diff
 * Using raf-loop instead of local module
 * Using uid module

0.0.19 / 2015-01-25
==================

 * Moved to browserify for the build

0.0.18 / 2015-01-25
==================

 * Fixed event delegation
 * Added some super basic perf tests
 * Fixed issue with scene not removing listeners

0.0.17 / 2015-01-24
==================

 * Fixed bug when changing root node. Closes #33

0.0.16 / 2015-01-23
==================

 * Fixed issue with channels not being sent to render

0.0.15 / 2015-01-23
==================

 * Added .channel and .prop methods
 * Removed .send and .onMessage in favour of channels
 * Scene is no longer immediately rendered

0.0.14 / 2015-01-21
==================

 * Add .send and .onMessage methods. You can call this.send(name, payload) within components and listen for those events on the scene with scene.onMessage(name, fn); 

0.0.13 / 2015-01-20
==================

 * Fixed a bug with IDs being identical
 * Added History.md

0.0.12 / 2015-01-19
==================

 * Add repo field
 * Updated bump
 * Updated release task
