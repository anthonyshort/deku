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

## Duo

```
import {element,tree,render} from 'segmentio/deku@0.2.1'
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