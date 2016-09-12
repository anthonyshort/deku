# Pre-rendered HTML Elements

When the browser requests the HTML file, some of the elements may have been pre-rendered on the server-side. This can be done using deku's [`string.render`](/deku/docs/api/string.html).


```html
<div id="container"> <p>pre-rendered text</p> </div>
```

On the client side, if we just create a render function as usual, the first call to the render function would not do anything. This is because deku would assume that the container's pre-rendered content is properly rendered.

```js
var render = createApp(document.getElementById("container"), { reuseMarkup: true })
render(<p>pre-rendered text</p>) // do nothing, just assign event listeners, if any
```

If the virtualDOM describes a different HTML element, deku will rerender it completely, even if `reuseMarkup` flag is set.

```js
var render = createApp(document.getElementById("container"), { reuseMarkup: true })
render(<p>Meow!</p>) // will perform full rerender
```

### Notes

- To avoid injecting 'react-id'-like attributes into tags, Deku hardly relies on order of pre-rendered nodes. 
- If starting part of pre-rendered nodes matches virtualDOM, Deku will reuse this part, but will rerender the rest.
- So this leads to the tip: if some components of your app are to be rendered on client-side only, it would be wise to place their markup closer to the end of the container to avoid full rerender of all other components.

