test:
	@echo Running unit tests...
	@mocha
	@echo Running jslint...
	@find lib -name "*.js" -type f -print0 | xargs -0 jslint
	@find test -name "*.js" -type f -print0 | xargs -0 jslint

.PHONY: test
