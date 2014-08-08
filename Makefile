#
# Binaries.
#

duo = ./node_modules/.bin/duo
mocha = ./node_modules/.bin/mocha

#
# Wildcards.
#

js = $(shell find ./ -name '*.js')

#
# Default.
#

default: build

#
# Tasks.
#

build: node_modules $(js)
	@$(duo) index.js build/build.js --development

test: node_modules $(js)
	@$(mocha) test

node_modules: package.json
	@npm install
	@touch node_modules # make sure node_modules is last modified

#
# PHONY
#

.PHONY: test