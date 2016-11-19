#!/usr/bin/env node

var converter = require('./dist/index.js');

var args = process.argv;

converter.convert('groovy2idl', args.length > 2 ? args[2] : undefined);