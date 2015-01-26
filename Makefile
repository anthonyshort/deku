
#
# Binaries.
#

export PATH := ./node_modules/.bin:${PATH}

#
# Wildcards.
#

lib = $(shell find index.js lib/*/*.js)
js = $(shell find index.js lib/*/*.js test/*.js)

#
# Default.
#

default: dist/deku.js

#
# Targets.
#

build.js: node_modules $(js)
	@browserify test/index.js > build.js

tests.js: node_modules $(js)
	@browserify test/index.js | bfc > tests.js

dist/deku.js: node_modules $(js)
	-@mkdir dist 2>/dev/null || true
	@browserify -s deku index.js | bfc > dist/deku.js
	@minify dist/deku.js > dist/deku.min.js

#
# Tests.
#

test: test-lint
	@mochify
.PHONY: test

test-browser: build.js
	@duo-test browser --commands 'make build.js'

test-cloud: tests.js
	@zuul -- tests.js

test-lint: $(lib)
	@jshint lib
.PHONY: lint

test-watch:
	@mochify --watch
.PHONY: watch

test-coverage:
	@mochify --cover
.PHONY: coverage

test-perf: node_modules
	@open perf/runner.html
.PHONY: perf

#
# Tasks.
#

node_modules: package.json
	@npm install

clean:
	@-rm -rf build.js tests.js dist
.PHONY: clean

distclean: clean
	@-rm -rf components node_modules
.PHONY: distclean

#
# Releases.
#

release: clean dist/deku.js
	bump $$VERSION && \
	git changelog --tag $$VERSION && \
	git commit --all -m "Release $$VERSION" && \
	git tag $$VERSION && \
	git push origin master --tags && \
	npm publish
.PHONY: release




