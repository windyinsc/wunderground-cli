#!/usr/bin/env node --harmony
'use strict'

const Config = require('./lib/config');
const Wunder = require('./lib/wunderapi');
const app = require('commander');
const chalk = require('chalk');

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
  .command('add [city]')
  .description('Searches for a city and adds it to the favorites')
  .action((city) => {
    
    if (!city) {
      console.error(new Error('You should enter a City!'));
    } else {
      wunder.searchCity(city)
      .then(res => cfg.saveCity(res))
      .then(res => {
        console.log('The city %s is saved!', chalk.green(res.name));
      })
      .catch(err => {
        console.error(err.message);        
      });
    }

  });

app
  .command('list')
  .description('Lists all cities you have saved')
  .option('-s, --stations', 'Shows the station identifier for each enry')
  .action((options) => {
    
    console.log('\nYou have %s saved cities!', cfg.data.cities.length);
    for (var i = 0; i < cfg.data.cities.length; i++) {
      
      console.log((options.stations) ? chalk.green(cfg.data.cities[i].name) + chalk.dim(' (' + cfg.data.cities[i].station + ')') : cfg.data.cities[i].name);      
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
