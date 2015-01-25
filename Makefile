
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
	@duo -r ./ test/index.js > build.js

tests.js: node_modules $(js)
	@duo -r ./ test/index.js | bfc > tests.js

dist/deku.js: node_modules $(js)
	-@mkdir dist 2>/dev/null || true
	@duo -s deku index.js | bfc > dist/deku.js
	@minify dist/deku.js > dist/deku.min.js

#
# Tasks.
#

lint: $(lib)
	@jshint lib

serve: node_modules
	@duo-serve index.js -g deku

test: build.js
	@duo-test browser -c 'make build.js'

test-phantom: build.js
	@duo-test phantomjs

test-cloud: tests.js
	@zuul -- tests.js

node_modules: package.json
	@npm install

perf: node_modules
	@open perf/runner.html

clean:
	@-rm -rf build.js tests.js dist

distclean: clean
	@-rm -rf components node_modules

release: clean dist/deku.js
	bump $$VERSION && \
	git changelog --tag $$VERSION && \
	git commit --all -m "Release $$VERSION" && \
	git tag $$VERSION && \
	git push origin master --tags && \
	npm publish

#
# Phonies.
#

.PHONY: lint
.PHONY: test
.PHONY: test-cloud
.PHONY: test-phantom
.PHONY: serve
.PHONY: perf
.PHONY: clean
.PHONY: distclean
