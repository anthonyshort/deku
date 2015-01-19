# API

## component([proto Object]) => `Component`

Create a new `Component` class. It takes an optional `proto` object that extends the prototype. There are a few special methods you can use to hook into lifecycle events in the component:

* `initialState`
* `propsChanged`
* `beforeMount`
* `afterMount`
* `beforeUpdate`
* `afterUpdate`
* `beforeUnmount`
* `afterUnmount`
* `render`

```js
var {component,dom} = require('deku');

var Button = component({
  render: function(props, state){
    return dom('button', props.text);
  }
});
```

As a shortcut for simple components, you can just pass in a render function:

```js
var Button = component(function(props, state){
  return dom('button', props.text);
});
```

Since the `Component` is just a plain constructor function, you can extend the prototype:

```js
var Button = component();

Button.prototype.render = function(props, state){
  return dom('button', props.text);
};
```

Or even just initialize them for testing:

```js
var button = new Button();
button.on('change', function(state){
  assert(state.text === 'Hello Steve!');
});
button.propsChanged({ name: 'Steve' });
```

## Component

The Component classes are what define parts of your UI. There are two type of data you need to use - `props` and `state` - or external and internal data. `props` is an immutable object of state passed down from the parent component or scene. `state` is internal data that only this component cares about. `state` can only be updated internally and `props` are updated externally.

#### Component.render(el HTMLElement, [props Object]) => `Scene`

Render the component to the DOM using `el` as the container and set the props. This returns a `Scene` object that manages all of the components within the graph.

```js
var scene = Button.render(document.body, {
  text: 'Click Me!'
});
```

#### Component.renderString([props Object]) => `String`

Render the component as a string instead of as HTML. This allows you to perform server-side rendering.

```js
var html = Button.renderString({
  text: 'Click Me!'
});

// <button>Click Me!</button>
```

#### Component.use(plugin Object|Function) => `self`

Use a plugin on a component. If you pass in an object it will just merge the object with the prototype of the Component. If you pass in a function it will be called with the Component class, similar to Express and other Node modules.

Here's how plugins are commonly used. 

```js
function plugin(options) {
  return function(Component){
    Component.prototype.onClick = function(){
      console.log(options.text);
    };
  };
}

Button.use(plugin({
  text: 'Clicked!'
}));
```

## Lifecycle Hooks

The lifecycle hooks are just methods added to the prototype of your Component class. You can add them directly 

#### Component#render(props, state) => `Object`

This is where you'll render the template for the component using the `dom` object. This method *must* return a Node from the the `dom` function.

```js
var {component,dom} = require('deku');

var Button = component({
  onClick: function(){
    console.log('clicked');
  },
  render: function(props, state){
    return dom('button', { onClick: this.onClick }, ['Click Me!']);
  }
});
```

#### Component#initialState() => `Object`

Use this hook to set the initial state for the component.

```js
var Button = component({
  initialState: function(){
    return {
      clicked: false
    };
  },
  onClick: function(){
    this.setState({ clicked: true });
  },
  render: function(){
    return dom('button', { onClick: this.onClick });
  }
});
```

#### Component#propsChanged(nextProps Object)

Use this hook to update state when the `props` has changed. This is called before the update hooks.

```js
var MyComponent = component({
  propsChanged: function(nextProps){
    this.setState({ text: 'Hello ' + nextProps.name });
  }
});
```

#### Component#beforeMount(props, state)

This hook is called just before the component is mounted in the DOM. This is also called when `renderString` is called.

```js
var Button = component({
  beforeMount: function(props, state){
    this.interval = setInterval(this.tick, 1000);
  }
});
```

#### Component#afterMount(el HTMLElement, props, state)

This hook is called after the component is mounted in the DOM. This gives you access to the DOM element of the component. This is the only place you can get access to the element.

```js
var Button = component({
  afterMount: function(el, props, state){
    console.log(el.innerWidth);
  }
});
```

#### Component#beforeUpdate(props, state, nextProps, nextState)

This hook is called just before the component is re-rendered. You cannot call `setState` within this method. Use `propsChanged` to do that.

```js
var Button = component({
  beforeUpdate: function(props, state, nextProps, nextState){
    
  }
});
```

#### Component#afterUpdate(props, state, prevProps, prevState)

This hook is called after the component is re-rendered. If you call `setState` in this method, it will be rendered in the next frame.

```js
var Button = component({
  afterUpdate: function(props, state, prevProps, prevState){
    
  }
});
```

#### Component#beforeUnmount(el HTMLElement, props, state)

This hook is called before the component is removed from the DOM. This can happen when the whole scene is removed, or a single component is removed from the tree. Use this to clean up any state, intervals, timeouts etc.

```js
var Button = component({
  beforeUnmount: function(el, props, state){
    
  }
});
```

#### Component#afterUnmount(props, state)

This hook is called after the component is removed from the DOM.

```js
var Button = component({
  afterUnmount: function(props, state){
    
  }
});
```

#### Component#setState(state Object, [callback Function]) => `void`

Within the lifecycle methods you can update the internal state of the component using this method. This will trigger an update on the next frame. Changes to the DOM aren't immediate, so you'll want to use the `afterUpdate` hook to do any extra processing or add a callback.

```js
var Button = component({
  beforeMount: function(){
    this.setState({ mounted: true });
  }
});
```

## Scene

When rendering a Component to the DOM, a scene object is returned that handles rendering the tree of components on each frame using `requestAnimationFrame`.

#### Scene#setProps(props Object, [callback Function]) => `Promise`

Set the `props` on the top-most component in the tree. This will invalidate the scene and the entire tree of components will be re-rendered on the next frame. Pass in a function that will be called after the scene has been updated. It also returns a Promise if the environment supports them.

#### Scene#pause()

Stop re-rendering of the scene. No changes to components will trigger a render.

#### Scene#resume()

Resume rendering of the scene on each frame.

#### Scene#remove()

Remove the scene and all components from the DOM. This will call the unmount hook on every component in the tree.

#### Scene#update()

Update the components in the scene if the scene is currently dirty.

## dom

#### dom(type String, attributes Object, children Array)

The `dom` function is what is used to create virtual nodes. You'll use this instead of traditional templates. There are a number of signatures for this method to make creating nodes easy. You can leave out the `attributes` or the `children` parameter.

If there is only one child node, you can use that instead of an array: `dom('div', { id: 'test' }, 'This is the content')`
