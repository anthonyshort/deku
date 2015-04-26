# Using JSX

There are a number of libraries around now that can transpile JSX into JS that aren't tied to React. The easiest way to use JSX with Deku is to use [Babel](https://github.com/babel/babel) (formerly known as 6to5). 

Babel comes with a JSX transformer that can be used by adding a comment to the top of your file:

```js
/** @jsx dom */
var {component,dom} = require('deku');
var Button = component()

Button.render = function(props, state) {
  return <a class="button" onClick={this.onClick}>{props.text}</a>;
}
```

This will transform your code roughly this:

```
Button.render = function(props, state) {
  return dom('a', { class: "button", onClick: this.onClick }, [props.text])
}
```

While it might seem a little weird using the JSX syntax, you should just think of it as a nicer syntax for defining trees of objects. 

You can also use [jsx-transform](https://github.com/alexmingoia/jsx-transform) if you're looking for something simple.