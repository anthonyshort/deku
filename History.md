
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
