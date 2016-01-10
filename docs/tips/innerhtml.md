# innerHTML

You sometimes need to set the `innerHTML` content of an element. For example, when you may transform some markdown content into a HTML string that you want rendered.

You can use the special `innerHTML` attribute and it will insert the html for you.

```js
let html = markdown('**Hello World**')
<div innerHTML={html} />
```

Will produce:

```html
<div>
  <strong>Hello World</strong>
</div>
```
