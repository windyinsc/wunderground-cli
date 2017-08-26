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
  .command('add [city]')
  .description('Searches for a city and adds it to the favorites')
  .action((city) => {
    
    if (!city) {
      console.error(new Error('You should enter a City!'));
    } else {
      wunder.searchCity(city)
      .then(res => cfg.saveCity(res))
      .then(res => {
        console.log('The city %s is saved!', res.name);
      })
      .catch(err => {
        console.error(err.message);        
      });
    }

  });

app
  .command('remove [id]')
  .alias('rm')
  .description('Removes a city from your list')
  .action(id => {

    if (!id) {
      console.error(new Error('You should specify the City ID (see: weather list)!'));
    } else {
      cfg.deleteCity(id)
        .then(res => {
          console.log('\nYour city has been removed.\n');
        })
        .catch(err => {
          console.error(err.message);
        });
    }
  });

app
  .command('list')
  .description('Lists all cities you have saved')
  .option('-s, --stations', 'Shows the station identifier for each entry')
  .action((options) => {

    wunder.list(options);

  });

app
  .command('now [id]')
  .description('Output of the actual weather of all saved cities')
  .option('-i, --imperial', 'Imperial units')
  .option('-m, --metric', 'Metric Units')
  .option('-f, --fahrenheit', 'Temperature in °F')
  .option('-c, --celsius', 'Temperature in °C')
  .action((id, options) => {
    if (!id) {
      wunder.now(cfg.data.cities);
    } else {
      wunder.now(cfg.data.cities[id - 1]);
    }
  });

app
  .command('alert [id]')
  .description('Alerts')
  .action(id => {
    if (!id) {
      // err
    } else {
      wunder.alert(id);
    }
  });

app.parse(process.argv);
if (app.args.length === 0) app.help();
