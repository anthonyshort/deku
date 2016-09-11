# Virtual elements

Virtual elements are objects that represent nodes in a tree, like the DOM. We call these 'virtual elements' because they create a fake DOM tree, a tree that looks like the real DOM but doesn't come with all the baggage of rendering real nodes.

Virtual elements are objects:

```js
{
  type: 'button',
  attributes: { class: 'Button' },
  children: ['Click me!']
}
```

They have:

* a `type` that can be any primitive value (e.g. string, object, or function);
* `attributes` that describe it's features;
* and `children`, which is just an array of more nodes.

This is how you would write it in HTML:

```html
<button class="Button">Click me!</button>
```

But these objects aren't easy to read or write so we can use the `element` function provided by Deku to make this a little nicer:

```js
element('button', { class: "Button" }, ['Click Me!'])
```

This function signature is the same that is expected by [JSX](/deku/docs/basics/JSX.html), so if you're using Babel you can use JSX. This will just compile back down to our simple `element` function above and end up becoming a plain object, just like what we started with:

```js
{
  type: 'button',
  attributes: { class: 'Button' },
  children: ['Click me!']
}
```

Deku just requires objects that look like that, which means you can use any library you want to create those nodes. If you wanted to add some custom functionality, you can wrap the element function with your own. For example, this would allow you to write the `class` attribute as an array or object:

```js
import {element} from 'deku'
import classnames from 'classnames'

export function magic (type, attributes, children) {
  let vnode = element(type, attributes, children)

  let classes = vnode.attributes.class
  if (classes) {
    vnode.attributes.class = classnames(classes)
  }

  return vnode
}
```

## Attributes: className aliased to class

Deku's `element` function aliases the attribute `className` to `class`, to ease porting JSX from other projects or to ease the transition to Deku if your tooling does things such as automatically expanding selector-style shortcuts into HTML tags, but using `className` instead of `class`.  Just don't try to use the two at the same time.

If your tooling is doing that, though, you should eventually fix it. ;)
