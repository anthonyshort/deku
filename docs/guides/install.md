# Installation

There are multiple ways to install and use Deku. No matter which option you choose, you should probably look at using an ES6 transformer like [Babel](https://babeljs.io).

## Browserify 

```
npm install deku
```

Browserify is the easiest way to use Deku if you're planning on doing server and client-side rendering. It also means it's very easy to use Babel to enable ES6 and JSX transforms using `babelify`.

```
browserify -t babelify main.js > build.js
```

## Webpack 

```
npm install deku
```

Like browserify, webpack analyzes all the require() calls in your app and builds a bundle that you can serve up to the browser.

```
webpack main.js build.js
```

The best way to configure webpack is with a `webpack.config.js`.

```
webpack --config webpack.config.js
```

Webpack uses loaders, and we can use the [babel loader](https://github.com/babel/babel-loader) to transform ES6 and JSX to ES5 as shown below in this example `webpack.config.js`.

```js
module.exports = {
  entry: './main.js',
  output: { path: __dirname, filename: 'bundle.js' },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel'
      }
    ]
  }
}
```

## Duo

```
import {tree,render} from 'dekujs/deku@0.5.0'
import element from 'dekujs/virtual-element@1.1.1'
```

With Duo you can just import directly from Github, then build it:

```
duo main.js > build.js
```

To use ES6 and JSX you'll need to install the [duo-babel](https://github.com/babel/duo-babel) transform:

```
duo --use duo-babel main.js > build.js
```

## Bower

```
bower install deku
```

## Manual Download

You can download the files manually from the [releases page](https://github.com/segmentio/deku/releases).
