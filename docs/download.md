# Download

There are multiple ways to install and use Deku. No matter which option you choose, you should probably look at using an ES6 transformer like [Babel](https://babeljs.io).

## Browserify

```
npm install deku
```

Browserify is the easiest way to use Deku if you're planning on doing server and client-side rendering. It also means it's very easy to use Babel to enable ES6 and JSX transforms using `babelify`.

```
browserify -t babelify main.js > build.js
```

## Manual Download

You can download the files manually from the [releases page](https://github.com/segmentio/deku/releases).
