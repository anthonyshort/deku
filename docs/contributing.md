# Contributing

Anyone is free to contribute to the project. Here are some general guidelines for contributing:

#### Feature requests

If you have a feature you'd like added, open up an issue first to discuss it with everyone. If the idea is accepted, it would be great if you would take the time to try and implement the feature and submit a pull request.

You should also add documentation for any new feature you'd added. PRs with passing tests are much, much more likely to get merged in.

#### Testing

The tests are run using [hihat](https://github.com/Jam3/hihat). This runs the tape tests in an Electron window with just the console. To run the tests, run `make test`.

#### Releasing

Releases are created using [release-it](https://github.com/webpro/release-it). You'll need to install the `release-it` CLI tool. e.g. `release-it 2.1.3`

### CI

Whenever you push a branch to dekujs/deku the tests are run in CircleCI. The unit tests are then run on many browsers at once using SauceLabs.
