#!/usr/bin/env node --harmony
'use strict'

const Promise = require('promise')
const fse = require('fs-extra')
const chalk = require('chalk')
const moment = require('moment')
const app = require('commander')

app
  .version('0.0.1')
  .option('-V, --verbose', 'Switches to Verbose Mode')

app
  .command('search [city]')
  .alias('s')
  .description('Searches for city in wunderground')
  .action(function (city) {
    // search for city
  })

app.parse(process.argv)
if (app.args.length === 0) app.help()
