#!/usr/bin/env node --harmony

'use strict'

const Config = require('./lib/config');
const Wunder = require('./lib/wunderapi');
const Ui = require('./lib/ui');
const app = require('commander');

var cfg = new Config();
var ui = new Ui();
var wunder = new Wunder(cfg.data.apikey);

app
  .version('0.3.0');

app
  .command('init [key]')
  .description('Initializes the Wunderground API')
  .action(key => ui.init(key));

app
  .command('settings')
  .description('Change temperature scale and system of measurement')
  .action(() => ui.settings());

app
  .command('add [city]')
  .description('Searches for a city and adds it to the favorites')
  .action(city => ui.add(city));

app
  .command('remove [id]')
  .alias('rm')
  .description('Removes a city from your list')
  .action(id => ui.remove(id));

app
  .command('list')
  .description('Lists all cities you have saved')
  .option('-s, --stations', 'Shows the station identifier for each entry')
  .action(options => ui.list(options));

app
  .command('now [id]')
  .description('Output of the actual weather of all saved cities')
  .action(id => ui.now(id));

app
  .command('alert [id]')
  .description('Alerts')
  .action(id => ui.alert(id));

app
  .command('forecast [id]')
  .description('10 day forecast for the city with a given id')
  .option('-d, --days <n>', 'number of days to be shown', parseInt)
  .action((id, options) => ui.forecast(id, options));

app.parse(process.argv);
if (!app.args.length === 0) app.help();