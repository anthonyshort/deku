# Virtual elements

Before we get into anything too complex we'll need to understand what virtual elements are and how they work. It will make everything else easier to understand as components are just functions that return virtual elements.

Virtual elements are objects that represent nodes in a tree, like the DOM. We call these 'virtual elements' because they create a virtual DOM tree, a tree that looks like the real DOM but doesn't come with all the baggage of rendering real nodes. But what we're really deal with are just nodes in tree.

Nodes can be represented as a simple object:

```js
{
  type: 'button',
  attributes: { class: 'Button' },
  children: []
}
```

They have:

* a `type` that can be any primitive value (e.g. string, object, or function);
* `attributes` that describe it's features;
* and `children`, which is just an array of more nodes.

Notice how we haven't even mentioned Deku yet. These elements can describe nodes in any tree structure. But for our sake we're going to use them to describe the DOM:

```js
var button = {
  type: 'button',
  attributes: { class: 'Button' },
  children: ['Click me!']
}
```

That's the same as writing this in HTML:

```html
<button class="Button">Click me!</button>
```

So you can probable see where we're going with this. We can describe the HTML we want rendered with a bunch of these nodes.

But these virtual elements aren't very easy to read or write so we can use a library to make this a little nicer. The simplest library to use is [virtual-element](https://www.npmjs.com/package/virtual-element). All this library does is provide a nice little API for creating these nodes:

```js
h('button', { class: "Button" }, ['Click Me!'])
```

It takes a type, optional attributes and an optional array of children. It's pretty close to writing real HTML. However this function signature is the same that is expected by [JSX](https://github.com/dekujs/deku/blob/master/docs/guides/jsx.md), so if you're using Babel you can write this instead:

```jsx
<button class="Button">Click Me!</button>
```

Woah, HTML in our JS! Don't worry, this will just compile back down to our simple `h` function above and end up becoming a plain object, just like what we started with:

```js
{
  type: 'button',
  attributes: { class: 'Button' },
  children: ['Click me!']
}
```

You don't nned to use JSX, but it will make life just that little bit nicer for you during development, but for you purists out there feel free to just use the other syntax and you'll be just fine.

Deku just requires objects that look like that, which means you can use any library you want to create those nodes. Say you wanted to allow the `class` attribute to [accept an object or array in addition to a string](https://www.npmjs.com/package/classnames), you could just create your own `virtual-element` module that does that and none of the other components will need to know about it. Neat, huh? This is one great feature that React doesn't have, custom virtual elements!
