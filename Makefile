#
# Vars.
#

BIN := ./node_modules/.bin

src = $(shell find src/*.js)
tests = $(shell find test/*.js)

#
# Targets.
#

default: test
$(src): node_modules
$(tests): node_modules

build: $(src)
	@mkdir -p dist
	@NODE_ENV=production ${BIN}/browserify \
		--standalone deku \
		-t babelify \
		-e src/index.js > dist/deku.js

test: lint
	@NODE_ENV=development ${BIN}/hihat test/index.js -- \
		--debug \
		-t babelify \
		-p tap-dev-tool

test-cloud: node_modules lint
	@TRAVIS_BUILD_NUMBER=$(CIRCLE_BUILD_NUM) ${BIN}/zuul -- ./test/index.js

node_modules: package.json
	@npm install

lint: $(src) $(tests)
	${BIN}/standard src/*.js test/*.js | ${BIN}/snazzy

#
# Always run these tasks.
#

.PHONY: build
