#
# Binaries.
#

export PATH := ./node_modules/.bin:${PATH}
BIN := ./node_modules/.bin

#
# Wildcards.
#

src = $(shell find src/*.js)
tests = $(shell find test/*.js)

#
# Targets.
#

default: test
$(src): node_modules
$(tests): node_modules

dist: $(src)
	@mkdir -p dist
	@NODE_ENV=production browserify \
		--standalone deku \
		-t babelify \
		-t envify \
		-e src/index.js | bfc > dist/deku.js

test: $(src) $(tests)
	@NODE_ENV=development hihat test/index.js -- \
		--debug \
		-t babelify \
		-t envify \
		-p tap-dev-tool

test-cloud: node_modules
	@TRAVIS_BUILD_NUMBER=$(CIRCLE_BUILD_NUM) zuul -- ./test/index.js

node_modules: package.json
	@npm install

clean:
	@-rm -rf dist node_modules

lint: $(src) $(tests)
	standard src/*.js | snazzy

size: dist
	@minify dist/deku.js | gzip -9 | wc -c

#
# These tasks will be run every time regardless of dependencies.
#

.PHONY: dist
.PHONY: clean
.PHONY: lint
.PHONY: size
.PHONY: release
.PHONY: test-cloud
