# Contributing

Anyone is free to contribute to the project. Here are some general guidelines for contributing:

### Feature requests

If you have a feature you'd like added, open up an issue first to discuss it with everyone. If the idea is accepted, it would be great if you would take the time to try and implement the feature and submit a pull request.

You should also add documentation for any new feature you'd added. PRs with passing tests are much, much more likely to get merged in.

Issues and pull requests with related gifs are very much preferred ;)

### Development

Deku is built with Browserify and Make. You can run the tests in a browser by running `make test`. You can view the rest of the commands available in the `Makefile`.

You should clone your own copy of Deku and make any changes in a branch.

### CI

Whenever you push a branch to dekujs/deku the tests are run in CircleCI. The unit tests are then run on many browsers at once using SauceLabs. 
