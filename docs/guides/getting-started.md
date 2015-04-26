# Getting Started

This tutorial will get you up and running with Deku in your project. It will run you through installing Deku and then creating a simple component. Deku has a similar API to React, so if you've used that before it should be easy to figure out how it works.

What you'll need know:

* How to use [Browserify](http://browserify.org) and [Babel](https://github.com/babel/babelify) 
* How to write ES6 JavaScript

## (Optional) Download the tutorial project

This includes the files 
You can download the [tutorial files](https://github.com/anthonyshort/deku-tutorial).

## 1. Install Deku and Browserify

You can install Deku using npm, Bower, Duo or you can simply download the built files and add them as a script tag to your page.

For this tutorial, I'm going to show you how to use Browserify with Deku. This is the recommended approach if you're looking to do server-side rendering. I'm also going to assume an ES6 syntax.

```
npm install --save deku browserify babelify
```

This is the command you will use to build your file:

```
browserify -t babelify index.js > build.js
```

## 2. Create a button
 
Create an `button.js` file and import `deku` (remember we're using ES6 syntax):

```js
import {element} from 'deku';

export function render() {
  return element('button', null, ['Click me']);
}
```

This creates a component that will render a `Button` element. Components are just plain objects so you can build them however you like: 

```js
import {element} from 'deku';

export let Button = {
  render() {
    return element('button', null, ['Click me']);
  }
}
```

The `element` function is a simple DSL for building trees. The syntax looks like this:

```
element(type String, [attributes Object,] [children Array])
```

This returns a `VirtualElement` that can be rendered by a renderer. 

## Optional: Using JSX

At this point, if you want to use JSX instead of writing out all of the element functions you can enable it with Babel by adding a comment to the top of your file:

```js
/** @jsx element */
import {element} from 'deku';

export function render() {
  return <button>Click me</button>
}
```

## 3. Adding event handlers

Deku can handle adding event handlers and will manage all of the delegation for you. We can add an `onClick` attribute that points to a function:

 ```js
let Button = component({
  onClick(e) {
    console.log('Clicked!');
  },
  render() {
    return dom('button', { onClick: this.onClick }, 'Click me');
  }
});
```

There are special attributes for [every native DOM event](https://github.com/anthonyshort/virtualize/blob/master/lib/element.js#L13). Unlike React, we don't create synthetic events. Because we're only targeting IE10+ we can capture every DOM event.

## 4. Render to the page

In your `index.js` file, we'll require this component and then render it to the page.

```js
import Button from './button';
import {scene,render} from 'deku';

var app = scene(Button);
render(app, document.body);
```

This will append a `Button` component to the page. You can click it and see it logging in the console. We first create a Scene using the `Button` component as the root. The scene manages the component tree and controls the state of the world. We then render this scene to the DOM using the `render` method. You can also render the scene as a string using `renderString`.

Wrap your code up with `browserify` in the command line and add that compiled script to your page:

```html
<script src="bundle.js"></script>
```

Load up the page and you should see your button in all of it's glory.

## 5. Adding props

Every component has two types of state - external and internal. These are `props` and `state` respectively. 

External state is passed in from parent components, or any other external data source. 

Internal state is controlled by the component and cannot be accessed from the outside. Think of internal state like `open` and `closed` and other bits of small internal data that affect the rendered component.

Lets pass some props into the Button to change what text is rendered.

```js
app.setProps({ text: "Hello World" })
```

The renderer will see this change on the scene and re-render on the next frame using `requestAnimationFrame`. 

We can access these props in our render method:

```js
let Button = component({
  onClick(e) {
    console.log('Clicked!');
  },
  render(props) {
    return dom('button', { onClick: this.onClick }, props.text);
  }
});
```

Build and reload your page again to see the button with updated text.

## 6. Adding state

Let's add some internal state. We'll set a counter and then increment this counter each time the button is pressed.

```js
let Button = component({
  onClick(e, props, state) {
    var count = state.count || 0;
    this.setState({ count: count += 1 })
  },
  render(props, state) {
    return dom('div', [
      dom('button', { onClick: this.onClick }, props.text),
      dom('span', 'Clicked ' + state.count || 0 + ' times')
    ]);
  }
});
```

You'll notice a couple of things here:

* We've wrapped our button in a div and added text in a span that shows the number of times the button has been pressed.
* We've added props and state parameters. Handlers are also passed the props and state after the event object.
* We're calling `setState` to mutate the state.

Changing the state won't affect the rendering of the component until the browsers next animation frame. On the next frame, all changes are bundled up and the component is rendered once.

At this point there are some important things to remember:

* The render method MUST return a `dom` object.
* The render method can only return one `dom` object.
* props cannot be changed from within the component.
* state cannot be changed from outside the component.

## 7. Composing components

The best part about components is that they can be composed within each other. For example, let's say we've create another component that renders a form and we want to add our custom button:

```js
import Button from './button';
import {component,dom} from 'deku';

let Form = component({
  render(props, state) {
    return dom('form', [
      dom('input', { type: text }),
      dom(Button, { text: 'Submit' })
    ]);
  }
})

export Form;
```

You'll notice we've imported our `Button` and we're using it in the `render` method. Instead of adding a tag name for what would normally be a HTML element, we've added the component, and passed in some props.

```js
dom(Button, { text: 'Submit' })
```

This is just like doing `.setProps()` but within the context of another component. Data flows downwards, so you could even do something like this:

```js
var app = scene(Form)
app.setProps({
  submitText: 'Save'
});
render(app, document.body);
```

And then pass it all the way down the tree:

```js
let Form = component({
  render(props, state) {
    return dom('form', [
      dom('input', { type: text }),
      dom(Button, { text: props.submitText })
    ]);
  }
})
```

## 8. Lifecycle hooks

Up till now you've seen one lifecycle hook, `render`, but there are a few more:

* `beforeMount`
* `afterMount`
* `beforeUpdate`
* `afterUpdate`
* `propsChanged`
* `beforeUnmount`
* `afterUnmount`

You can add any of these as functions to hook into the component at any point. You can learn more about it in the [Component API](https://github.com/segmentio/deku/wiki/api-component) page.