# Hot Module Replacement

Being purely functional, Hot Module Replacement (HMR), i.e. code swapping at runtime, comes with virtually no cost while using **deku**.

Here is therefore how to setup HMR for **deku** using [webpack](https://webpack.github.io/).

## 1. Installing the necessary dependencies

First we need to create a project:

```bash
mkdir project
cd project
npm init
```

Then to install some dependencies:

```bash
npm install --save deku
npm install --save-dev babel-core babel-loader babel-plugin-transform-react-jsx babel-preset-es2015 express webpack webpack-dev-middleware webpack-hot-middleware
```

## 2. Create a webpack config

The following webpack config will enable HMR and compile ES2015/JSX code.

```js
// file: webpack.config.js

var webpack = require('webpack'),
    path = require('path');

module.exports = {
  devtool: '#source-map',
  entry: [
    'webpack-hot-middleware/client',
    './main.jsx'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    library: 'app',
    publicPath: '/build/'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: [['transform-react-jsx', {pragma: 'element'}]]
        }
      }
    ]
  }
};

```

## 3. Create a development server

We need to setup a little server that will serve our code and assets while being able to send HMR updates.

```js
// file: server.js

var webpack = require('webpack'),
    config = require('./webpack.config.js'),
    dev = require('webpack-dev-middleware'),
    hot = require('webpack-hot-middleware'),
    express = require('express'),
    path = require('path');

var compiler = webpack(config);

var app = express();

app.use(dev(compiler, {publicPath: config.output.publicPath}));
app.use(hot(compiler));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

console.log('Compiling...');
app.listen(3000, 'localhost', function (err) {
  if (err) return console.err(err);
});
```

## 4. Creating our HTML file, JS entry and a root component

```html
<!DOCTYPE html>
<html>
<head>
  <title>Deku HMR Example</title>
</head>
<body>
  <div id="mount"></div>
  <script type="text/javascript" src="/build/bundle.js"></script>
</body>
</html>
```

```js
file: components/Application.jsx

import {element} from 'deku';

export default {
  render() {
    return (
      <div>
        <p>
          Hello World!
        </p>
        <div>
          <button>Click Me</button>
        </div>
      </div>
    );
  }
}
```

```js
file: main.jsx

import {dom, element} from 'deku';
import Application from './components/Application.jsx';

const render = dom.createRenderer(document.getElementById('mount'));

// Rendering function
function renderApplication(Component) {
  render(<Component />)
}

// First render
renderApplication(Application);

// Hooking into HMR
// This is the important part as it will reload your code and re-render the app accordingly
if (module.hot) {
  module.hot.accept('./components/Application.jsx', function() {
    const nextApplication = require('./components/Application.jsx').default;
    renderApplication(nextApplication);
  });
}
```

## 5. Starting the development server

Now, our working directory should look like the following:

```
project/
  components/
    Application.jsx
  index.html
  main.jsx
  package.json
  server.js
  webpack.config.js
```

Let's launch the dev server and code:

```bash
node server.js
```

Wait for webpack to perform the initial compilation and let's visit `localhost:3000`.

You should now be able to edit your components without reloading the browser!
