#
# Binaries.
#

export PATH := ./node_modules/.bin:${PATH}
BIN := ./node_modules/.bin

#
# Wildcards.
#

src = $(shell find source/*.js)
tests = $(shell find test/**/*.js)

#
# Targets.
#

default: test
$(src): node_modules
$(tests): node_modules

standalone: $(src)
	@mkdir -p build
	@NODE_ENV=production browserify \
		--standalone deku \
		-t babelify \
		-t envify \
		-e lib/index.js | bfc > build/deku.js

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
	@-rm -rf build build.js node_modules

lint: $(src) $(tests)
	standard lib/**/*.js | snazzy

size: standalone
	@minify build/deku.js | gzip -9 | wc -c

#
# Releases.
#

release: standalone
	bump $$VERSION && \
	git changelog --tag $$VERSION && \
	git commit --all -m "Release $$VERSION" && \
	git tag $$VERSION && \
	git push origin master --tags && \
	npm publish

#
# These tasks will be run every time regardless of dependencies.
#

.PHONY: standalone
.PHONY: clean
.PHONY: lint
.PHONY: size
.PHONY: release
.PHONY: test-cloud
