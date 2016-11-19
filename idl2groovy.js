#!/usr/bin/env node

var converter = require('./dist/index.js');

var args = process.argv;

converter.convert('idl2groovy', args.length > 2 ? args[2] : undefined);