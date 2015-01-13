
#
# Binaries.
#

TEST := ./node_modules/.bin/duo-test
DUO := ./node_modules/.bin/duo

#
# Wildcards.
#

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

lint:
	jshint test/**/*.js lib/**/*.js

deku.js:
	duo -s deku index.js | bfc > deku.js

serve:
	duo serve index.js -g component

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

.PHONY: clean
.PHONY: distclean
