# Keys

Virtual elements can have a special attribute called `key` that is used to optimize the rendering. It lets Deku know if an element has just been moved around. For example, imagine these virtual elements are returned as children:

```html
<MyComponent />
<div>Hello</div>
```

Then on the next render it looks like this:

```html
<div>Hello</div>
<MyComponent />
```

Deku will compare the two first elements, see they're different and destroy `<MyComponent />` and replace it with a div. The div will also be destroyed and replaced with a new `<MyComponent />`. Most of the time this won't affect you, most components don't store state in any way, and most HTML elements don't have hidden state (except inputs and friends). If for some reason these elements have state that needs to hang around, we can add a key:

```html
<MyComponent key="one" />
<div key="two">Hello</div>
```

Deku will then know on the second pass that they've just moved around, so it won't destroy the elements.
