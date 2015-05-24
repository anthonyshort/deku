
#
# Binaries.
#

export PATH := ./node_modules/.bin:${PATH}
BIN := ./node_modules/.bin

#
# Wildcards.
#

lib = $(shell find lib/*.js)
js = $(shell find lib/*.js test/*.js)

#
# Default.
#

default: index.js

#
# Targets.
#

build.js: node_modules $(js)
	@browserify -d -e test/index.js -t [ babelify --optional es7.asyncFunctions ] > build.js

tests.js: node_modules $(js)
	@browserify -d -e test/index.js -t [ babelify --optional es7.asyncFunctions ] | bfc > tests.js

index.js: node_modules $(js)
	@browserify -s deku lib/index.js | bfc > index.js

#
# Tests.
#

test: build.js
	@$(BIN)/duo-test browser --commands 'make build.js'

test-phantom:
	@$(BIN)/mochify --transform babelify --phantomjs ./node_modules/.bin/phantomjs --ui bdd ./test/index.js
.PHONY: test

test-cloud: tests.js
	@TRAVIS_BUILD_NUMBER=$(CIRCLE_BUILD_NUM) zuul -- tests.js

test-lint: $(lib)
	@$(BIN)/standard lib/*
.PHONY: test-lint

test-watch:
	@$(BIN)/mochify --watch
.PHONY: watch

test-coverage:
	@$(BIN)/mochify --cover
.PHONY: coverage

test-size: index.js
	$(BIN)/minify index.js | gzip -9 | wc -c
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
