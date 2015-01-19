# Developing

Deku is built using Duo. This is a package manager like Browserify but has more features for front-end development, like CSS support.

First, make sure everything is installed:

```
npm install
```

Then you can run the tests:

```
make test
```

This will run the mocha tests and open a browser. This is usually left running during development.

## SauceLab Tests

```
make test-cloud
```

To test cross-browser via Saucelabs.