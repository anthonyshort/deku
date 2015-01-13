
#
# Binaries.
#

TEST := ./node_modules/.bin/duo-test
DUO := ./node_modules/.bin/duo
SERVE := ./node_modules/.bin/duo-serve
BFC := ./node_modules/.bin/bfc
JSHINT := ./node_modules/.bin/jshint

#
# Wildcards.
#

lib = $(shell find index.js lib/*/*.js)
js = $(shell find index.js lib/*/*.js test/*.js)

#
# Default.
#

default: test

#
# Tasks.
#

build: node_modules $(js)
	@$(DUO) -r ./ test/index.js > build.js

lint: $(lib)
	@$(JSHINT) lib

deku.js: $(js)
	@$(DUO) -r ./ -s deku index.js

serve:
	@$(SERVE) index.js -g component

test: build
	@$(TEST) browser -c 'make build'

headless: build
	@$(TEST) phantomjs -c 'make build'

node_modules: package.json
	@npm install
	@touch node_modules # make sure node_modules is last modified

clean:
	@-rm -rf build.js deku.js

distclean:
	@-rm -rf components node_modules

#
# Phonies.
#

.PHONY: serve
.PHONY: clean
.PHONY: distclean
