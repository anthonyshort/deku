# Keys

Elements can have a special attribute named `key`. This lets the renderer know how to identify an element amongst sibling elements so it can determine if an element has just been moved, instead of removing and replacing DOM nodes unnecessarily.

* `key` is a special attribute that won't be passed in as a prop or rendered in the DOM.
* They increase the rendering performance of large lists.
* They only need to be unique to sibling elements.
* They can be used to maintain state of form elements, like `input` and `select`.
* Not every sibling needs a key. You can add a `key` to the elements you want to be moved around.

## Example

In this example, we use the key attribute to make sure the input element is moved instead of replaced whenever the hint is added and removed:

```js
<div>
  <label>Name</label>
  {showHint ? <span>Enter your full name</span> : null}
  <input type="name" key="input" />
</div>
```

In the next example, we use keys to improve the rendering performance of a list. You can use the `id`, `name`, or other unique field for the list item.

```js
let people = [
  { id: 1, name: 'Tom' },
  { id: 2, name: 'Dick' },
  { id: 3, name: 'Harry' }
]

let el =
  <ul>
    {people.map(person => <li key={person.id}>{person.name}</li>)}
  </ul>
```

## Why do we need keys?

To see why we need to do this we need to explain how the renderer compares lists of elements. Imagine on the first render these elements are return:

```html
<div>
  <span>One</span>
  <div>Two</div>
  <span>Three</span>
</div>
```

Then on the next render this element is returned:

```html
<div>
  <span>One</span>
  <span>Three</span>
  <div>Two</div>
</div>
```

The third element has moved up. This is obvious to humans. But when the renderer is performing the diff it is just comparing the left and right sides one after the other:

```
<span>One</span>    -> <span>One</span>     // No change. Leave it.
<div>Two</div>      -> <span>Three</span>   // Different element. Replace!
<span>Three</span>  -> <div>Two</div>       // Different element. Replace!
```

Most of the time this won't affect you but there are a couple of cases where this becomes a problem:

* When you have a large list of elements (thousands) that have moved around. The renderer will be removing and creating large sets of DOM elements.
* When elements with hidden state, like `input` fields, are moved around. Their state will be lost because they've been destroyed and recreated.

To get around this we can just add a `key` attribute:

```js
<div>
  <span key="one">One</span>
  <div key="two">Two</div>
  <span key="three">Three</span>
</div>
```

Now during the diff the renderer will know that elements have just moved:

```
<span>One</span>    -> <span>One</span>     // No change. Leave it.
<div>Two</div>      -> <div>Two</div>       // Move to position 2!
<span>Three</span>  -> <span>Three</span>   // Move to position 1!
```

**These keys only need to be unique to siblings.** They don't need to be globally unique like the `id` attribute.

You can also add keys only to the elements you want moved around if that's easier.

```js
<div>
  <span>One</span>
  <div>Two</div>
  <span key="hello">Three</span>
</div>
```
