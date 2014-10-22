#
# Binaries.
#

duo = ./node_modules/.bin/duo
test = ./node_modules/.bin/duo-test

#
# Wildcards.
#

js = $(shell find index.js lib/*.js test/*.js)

#
# Default.
#

default: test

#
# Tasks.
#

build: node_modules $(js)
	@$(duo) -r ./ test/index.js > build.js

test: build
	@$(test) browser -c 'make build'

headless: build
	@$(test) phantomjs -c 'make build'

node_modules: package.json
	@npm install
	@touch node_modules # make sure node_modules is last modified

clean:
	@-rm -r build.js

distclean:
	@-rm -r components node_modules

#
# PHONY
#

.PHONY: clean
.PHONY: distclean
