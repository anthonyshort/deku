# virtual-dom

Create a virtual DOM that can be used to update the real DOM using diffs.

```js
var {div} = require('virtual-dom');

function template(data) {
    return div({ class: data.class }, [data.text]);
};

var node = template({ class: 'test', text: 'Hello World' });
var el = node.toElement(); // <div class="test">Hello World</div>
var updated = template({ class: 'foo' });
var patch = node.diff(updated);

patch(el);
// el === <div class="foo"></div>

```
