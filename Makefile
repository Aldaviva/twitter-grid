BUNYAN := node_modules/bunyan/bin/bunyan
JSL := jsl
NODE := node
NPM := npm

run:
	@$(NODE) . | $(BUNYAN)

.PHONY: lint
lint:
	@find lib -name "*.js" | xargs $(JSL) --conf=tools/jsl.conf --nofilelisting --nologo --nosummary *.js
