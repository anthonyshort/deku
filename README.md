# virtual-dom

Create a virtual DOM that can be used to update the real DOM using diffs.

```js
var dom = require('virtual-dom');

function render(data) {
  return dom('div')
    .styles({ color: "red" })
    .class(['foo', 'bar']);
    .attrs({ name: data.name })
    .children([data.text]);
};

var node = render({ class: 'test', text: 'Hello World', name: 'title' });
var el = node.toElement(); 
// el === <div class="foo bar" name="title">Hello World</div>

// Create a new node and compare it
var updated = render({ class: 'foo' });
var patch = node.diff(updated);

// Patch the original element so that it matches
// the new node using the diff
patch(el);
// el === <div class="foo"></div>

```

## API

## Setting Attributes

```
var node = dom();

node.attrs({ name: 'Hello World' });

// node.toString() === <div name="Hello World"></div>

node.attrs({ size: 'large' });

// node.toString() === <div size="large"></div>

### Using thunks

```
node.attrs(function(){
    return {
        foo: 'bar'
    }
});

// node.toString() === <div foo="bar"></div>
```

### Boolean Attributes

Attributes with boolean values are either added or removed.

```
node.attrs({ hidden: true });

// node.toString() === <div hidden></div>

node.attrs({ hidden: false });

// node.toString() === <div></div>
```

### Empty Attributes

Empty attrsibutes won't render.

```
node.attrs({ foo: '' });

// node.toString() === <div></div>
```

## Getting Attributes

```
var node = dom();
node.attrs({ name: 'Hello World' });

node.attrs('name') // 'Hello World';
```