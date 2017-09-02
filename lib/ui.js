'use strict';

const Promise = require('promise');
const Wunder = require('./wunderapi');
const Config = require('./config');
const inquirer = require('inquirer');
const chalk = require('chalk');
const asciify = require('asciify');
const size = require('window-size');
const cliui = require('cliui');

class UI {

  constructor() {

    this.cfg = new Config();
    this.wunder = new Wunder(this.cfg.data.apikey);

  }


  /**
   * Saves the API key in the config file
   * 
   * @param {String} apikey 
   * @memberof UI
   */
  init(apikey) {

    if (!apikey) {
      console.error(new Error('\nYou should enter a valid API key!\n').message);
    } else {

      if (this.cfg.data.apikey !== '' && this.cfg.data.apikey !== apikey) {

        console.log('\r');
        inquirer.prompt({
          type: 'confirm',
          name: 'overwrite',
          message: 'Another API key already exists. Do you want to overwrite it?',
          default: false
        }).then(res => {

          if (!res.overwrite) {
            console.error(new Error('\nAs you wish!\n').message);
          } else {
            this.cfg.saveKeys({apikey: apikey}).then(res => console.log('\nYour API key is saved successfully.\n')).catch(err => console.error(err.message));
          }
        });
      } else if (this.cfg.data.apikey === apikey) {
        console.error(new Error('\nYou already have saved this API key.\n').message);
      } else {
        this.cfg.saveKeys({apikey: apikey}).then(res => console.log('\nYour API key is saved successfully.\n')).catch(err => console.error(err.message));
      }
    }
  }


  /**
   * Adds a city to the config file and asks if there were more than one results
   * 
   * @param {String} city 
   * @memberof UI
   */
  add(city) {

    if (!city) {
      console.error(new Error('You must enter a valid City!').message);
    } else {

      this.wunder.searchCity(city).then(res => {

        return new Promise((resolve, reject) => {

          if (res.length > 1) {
            inquirer.prompt({
              type: 'list',
              name: 'city',
              message: 'Which city are you looking for?',
              choices: res
            }).then(r => {
              resolve(res[r.city]);
            });
          } else {
            resolve(res[0]);
          }
        });
      }).then(res => this.cfg.saveCity(res))
      .then(res => {
        console.log('The city %s is saved!', chalk.yellow(res.name));
      }).catch(err => {
        console.error(err.message);
      });
    }
  }


  /**
   * Removes a city by ID from the config file
   * 
   * @param {Int} id 
   * @memberof UI
   */
  remove(id) {

    if (!id) {
      console.error(new Error('You should specify the City ID (see: weather list)!').message);
    } else {
      this.cfg.deleteCity(id)
      .then(res => {
        console.log('\nThe city %s has been removed.\n', chalk.yellow(res.name));
      })
      .catch(err => {
        console.error(err.message);
      });
    }
  }


  /**
   * Lists all cities which are saved in the config file  
   * 
   * @param {any} options 
   * @memberof UI
   */
  list(options) {

    console.log('\nYou have %s saved cities!\n', this.cfg.data.cities.length);
    for (var i = 0; i < this.cfg.data.cities.length; i++) {

      if (options.stations) {
        console.log(chalk.white((i + 1) + '. ') + chalk.green(this.cfg.data.cities[i].name) + chalk.dim(' (' + this.cfg.data.cities[i].station + ')'));
      } else {
        console.log(chalk.white((i + 1) + '. ') + chalk.green(this.cfg.data.cities[i].name));
      }
    }
    console.log('\r');
  }


  /**
   * Shows the weather for one or all cities right now
   * 
   * @param {Int} id 
   * @memberof UI
   */
  now(id) {

    let promises = [];
    let data = (!id) ? this.cfg.data.cities : this.cfg.data.cities[id - 1];

    if (typeof data.length !== 'undefined') {
      for (var i = 0; i < data.length; i++) {
        promises.push(this.wunder.getWeather(data[i]));
      }
    } else {
      promises.push(this.wunder.getWeather(data));
    }

    Promise.all(promises).then(res => {

      for (var i = 0; i < res.length; i++) {
        console.log('\n' + chalk.red(res[i].city) + chalk.white(' (' + res[i].elevation + ')'));
        console.log(chalk.blue(res[i].station_city));
        console.log(chalk.dim(res[i].time) + '\n');
        console.log(chalk.green(res[i].description));
        console.log('Temperature: %s', chalk.yellow(res[i].temp));
        console.log('Feels like: %s', chalk.yellow(res[i].feels));
        console.log('Humidity: %s', chalk.yellow(res[i].humidity));
        console.log('Dewpoint: %s', chalk.yellow(res[i].dewpoint));
        console.log('Pressure: %s', chalk.yellow(res[i].pressure));
        console.log('Wind: %s', chalk.yellow(res[i].wind));

        console.log('\n');
      }
    }).catch(err => {
      console.error(err.message);
    });
  }

}

module.exports = UI;