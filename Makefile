
#
# Binaries.
#

export PATH := ./node_modules/.bin:${PATH}
BIN := ./node_modules/.bin

#
# Wildcards.
#

lib = $(shell find lib/*/*.js)
js = $(shell find lib/*/*.js test/*.js)

#
# Default.
#

default: index.js

#
# Targets.
#

build.js: node_modules $(js)
	@browserify test/index.js -t babelify > build.js

tests.js: node_modules $(js)
	@browserify test/index.js -t babelify | bfc > tests.js

index.js: node_modules $(js)
	@browserify -s deku lib/index.js | bfc > index.js

#
# Tests.
#

test:
	@mochify
.PHONY: test

test-browser: build.js
	@$(BIN)/duo-test browser --commands 'make build.js'

test-cloud: tests.js
	@TRAVIS_BUILD_NUMBER=$(CIRCLE_BUILD_NUM) zuul -- tests.js

test-lint: $(lib)
	@jshint lib
.PHONY: lint

test-watch:
	@mochify --watch
.PHONY: watch

test-coverage:
	@mochify --cover
.PHONY: coverage

test-size: index.js
	minify index.js | gzip -9 | wc -c
.PHONY: test-size

#
# Tasks.
#

node_modules: package.json
	@npm install

clean:
	@-rm -rf build.js index.js tests.js
.PHONY: clean

distclean: clean
	@-rm -rf components node_modules
.PHONY: distclean

#
# Releases.
#

release: clean index.js
	bump $$VERSION && \
	git changelog --tag $$VERSION && \
	git commit --all -m "Release $$VERSION" && \
	git tag $$VERSION && \
	git push origin master --tags && \
	npm publish
.PHONY: release
