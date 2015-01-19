# Deku vs. React

You might be wondering why Deku was even created seeing as it has an API similar to that of React. There are a couple of reasons this project needed to be created:

## Readability

When I was trying to learn about how the system worked in React, it's a mess to understand. I wanted something simple that could be extended, built upon and learned from. 

By building Deku in small modules, and avoiding support for older browsers, we end up with something that is much more digestable and easy to debug.

## The API

The API for React is actually quite good. The component API is small and easy to get your head around. But the whole thing still relies on globals and global state. Components you create with React need to the library to be used later. The consumer of your component shouldn't care what library is used, but I'll touch on this next.

JSX is nice, but having a lot of template code inline inside your component just ends up messy. We need something that allows us to break apart the render function. We keep the virtual DOM syntax simple and encourage small functions for building up templates, rather than sticking HTML throughout the component.

## Independent Components

React components rely on using the `React` global to mount/render components onto the page. This means you can only really have one version of React on your page at once, and all your components need to work on the same version. This is essentially a global.

Instead, with Deku, components are independent and don't actually require a global to be rendered. For instance, a `Button` component can be used on the page with `Button.render()` instead of needing a global object. This means you could build and distribute UI components and the user doesn't even need to know what's running in the background. 

For example, we could create a `Slideshow` component and use it like this:

```js
var Slideshow = require('super-slideshow');

Slideshow.render(document.body, {
    slides: [],
    auto: true
});
```

The user wouldn't have to know or care that you're using Deku. They don't need to install it themselves like you do with React, and you don't need to worry about conflicting versions.

## requestAnimationFrame

DOM updates in Deku are batched and performed on the next frame using the browsers `requestAnimationFrame` API. This means that updates are only triggered when the browser is about to repaint anyway avoiding any layout thrashing or sluggishness. 

## Testing Components

The components you create with Deku are actually just simple constructor functions. There's nothing special about them. They just define the hooks the the entity behind the scenes will use when rendering your component. This means you can easily test components by creating instances of them:

```js
var Button = component({
  render: function(props){
    return dom('button', props.text);
  }
});

var myButton = new Button();
var dummyProps = { text: 'foo' };
var node = myButton.render(dummyProps);
assert(node.tagName === 'button'); 
assert(node.children[0].data === 'foo');
```

This allows you to test your components quickly without needing to mock or stub any objects. The component instances themselves **have no state** so they're extremely easy to test. Just pass in the `props` or `state` into your hooks and run assertions.

## Plugins and Mixins

React uses mixins to share functionality across components, however the syntax doesn't really match the way most JS frameworks work. Deku instead uses the `.use` pattern, just like in Express or Koa.

```js
var Button = component()
  .use(setInterval())
  .use(debug());
```

From here you can mixin objects, or listen to events on the component.

[Learn more](https://github.com/segmentio/deku/blob/master/docs/api.md#componentuseplugin-objectfunction--self) about plugins.

## Immutable State Atom

Taking ideas from Om and other libraries, the next step for Deku is to place the state of all components into an immutable data structure. This will allow extremely fast diffing and updating of components and will allow the entire scene state to be serialized. The user will continue using state and props as they normally do, but behind the scenes everything will get much faster.


