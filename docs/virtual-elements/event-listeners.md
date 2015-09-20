# Adding event handlers

You can add event handlers using attributes. There are a number of attributes that Deku will recognize for you. Here are the built-in events:

```js
export let events = {
  onBlur: 'blur',
  onChange: 'change',
  onClick: 'click',
  onContextMenu: 'contextmenu',
  onCopy: 'copy',
  onCut: 'cut',
  onDoubleClick: 'dblclick',
  onDrag: 'drag',
  onDragEnd: 'dragend',
  onDragEnter: 'dragenter',
  onDragExit: 'dragexit',
  onDragLeave: 'dragleave',
  onDragOver: 'dragover',
  onDragStart: 'dragstart',
  onDrop: 'drop',
  onError: 'error',
  onFocus: 'focus',
  onInput: 'input',
  onInvalid: 'invalid',
  onKeyDown: 'keydown',
  onKeyPress: 'keypress',
  onKeyUp: 'keyup',
  onMouseDown: 'mousedown',
  onMouseEnter: 'mouseenter',
  onMouseLeave: 'mouseleave',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
  onPaste: 'paste',
  onReset: 'reset',
  onScroll: 'scroll',
  onSubmit: 'submit',
  onTouchCancel: 'touchcancel',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchStart: 'touchstart',
  onWheel: 'wheel'
}
```

These are treated as special attributes:

```js
function App (model) {
  return <button onClick={clicked}>Hello World</button>
}

function clicked (e) {
  console.log(e)
}
```

These handlers will be added and removed for you. With each render, if the handler doesn't match the new handler, they are swapped.

## Does Deku delegate events?

Deku doesn't automatically delegate events to keep things simple but it is a good way to avoid adding hundreds of listeners. To delegate events you can just bind at the parent element.

```js
function List (model) {
  return (
    <ul onClick={onClick}>
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  )
}

function onClick (e) {
  if (e.target.tagName === 'LI') {
    console.log('clicked')
  }
}
```

## How do I access my the model in an event handler?

If you want to send extra information to the handler you can curry or partially apply the handler function. We don't provide any special parameters to the event handlers, so it's as if you called `el.addEventListener` directly.

```js
function App (model) {
  return <div onClick={onClick(model)}>Hello World</div>
}

function onClick (model) {
  return function (e) {
    console.log(model, e)
  }
}
```

Because the handler is changing the function on every render, it will add the new event listener each time like you'd expect.

## How do I listen to custom events?

Using [attribute hooks](#custom-attribute-hooks) you could also apply the binding yourself:

```js
function App (model) {
  return <input doSomething={el => el.addEventListener('input', fn)} />
}
```

This is useful if you want to support any events that aren't built into the DOM renderer, like custom events.
