#!/usr/bin/env node --harmony
'use strict'

const Config = require('./lib/config');
const Wunder = require('./lib/wunderapi');
const app = require('commander');

var cfg = new Config();
var wunder = new Wunder(cfg.data.apikey);

app
  .version('0.0.1')
  .option('-V, --verbose', 'Switches to Verbose Mode');

app
  .command('init [key]')
  .description('Initializes the Wunderground API')
  .action(key => {

    if (!key) {
      console.error(new Error('You should enter a valid API key!'));
    } else {
      cfg.saveKey(key)
      .then(res =>{
        console.log('Your API key is saved successfully.');
      })
      .catch(err => {
        console.error(err.message);
      });
    }
  });

app
  .command('search [city]')
  .alias('s')
  .description('Searches for city in wunderground')
  .action((city) => {
    
    if (!city) {
      console.error(new Error('You should enter a City!'));
    } else {
      wunder.searchCity(city)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.error(err.message);        
      });
    }

  });

app
  .command('now')
  .description('Output of the actual weather of all saved cities')
  .action(() => {
    // output
  });

app.parse(process.argv);
if (app.args.length === 0) app.help();
