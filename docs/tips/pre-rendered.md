# Pre-rendered HTML Elements

When the browser requests the HTML file, some of the elements may have been pre-rendered on the server-side. This can be done using deku's [`string.render`](/deku/docs/api/string.html).


```html
<div id="container"> <p>pre-rendered text</p> </div>
```

On the client side, if we just create a render function as usual, the first call to the render function would not do anything. This is because deku would assume that the container's pre-rendered content is properly rendered.

```js
var render = createApp(document.getElementById("container"))
render(<p>pre-rendered text</p>) //do nothing
```

This means if the virtualDOM describes a different HTML element, deku is not going to fix it for you.

```js
var render = createApp(document.getElementById("container"))
render(<p>Meow!</p>) //do nothing
```

Therefore, to be 100% safe, one may want to do a [checksum comparison](https://en.wikipedia.org/wiki/Checksum) between the pre-rendered (on the server-side) and to-be-rendered (from the virtualDOM) HTML elements. This can be done by setting the attribute `checksum` for the container element.

```html
<div id="container" checksum> <p>pre-rendered text</p> </div>
```

In this case, on the first call to the render function, deku would destroy and recreate the elements inside the container, if there is a difference between the pre-rendered and to-be-rendered versions:

```js
var render = createApp(document.getElementById("container"))
render(<p>Meow!</p>) //re-rendered the HTML due to difference in checksums
```
