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

Therefore, to be 100% safe, one may want to use the `autoFix` attribute:

```html
<div id="container" autoFix> <p>pre-rendered text</p> </div>
```

In this case, on the first call to the render function, deku would destroy and recreate the elements inside the container, after a quick string-comparison of the pre-rendered and to-be-rendered versions:

```js
var render = createApp(document.getElementById("container"))
render(<p>Meow!</p>) //re-rendered the HTML due to difference in HTML strings
```

Alternatively, one can also choose to do a [checksum comparison](https://en.wikipedia.org/wiki/Checksum) between the HTML strings instead. This can be done by getting the server to compute the [Adler32](https://en.wikipedia.org/wiki/Adler-32) checksum value of the string and add it to the container element's `checksum` attribute.

```html
<div id="container" checksum="1838352550"><p>pre-rendered text</p></div>
```

and similar to the using `autoFix` attribute, deku would fix the incorrect pre-rendered HTML on the first call to the render function.

```js
var render = createApp(document.getElementById("container"))
render(<p>Meow!</p>) //re-rendered the HTML due to difference in adler32 checksums
```
