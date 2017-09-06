'use strict';

const Promise = require('promise');
const Wunder = require('./wunderapi');
const Config = require('./config');
const Digits = require('./digits');
const inquirer = require('inquirer');
const chalk = require('chalk');
const asciify = require('asciify');
const figlet = require('figlet');
const size = require('window-size');
const cui = require('cliui') ({
    width: size.width
});

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



  nownew(id) {

    let promises = [];
    let cities = (!id) ? this.cfg.data.cities : this.cfg.data.cities[id - 1];

    if (typeof cities.length !== 'undefined') {
      for (var i = 0; i < cities.length; i++) {
        promises.push(this.wunder.getWeather(cities[i]));
        promises.push(this.wunder.getAlert(cities[i]));
        promises.push(this.wunder.getForecast(cities[i]));
      }
    } else {
      promises.push(this.wunder.getWeather(cities));
      promises.push(this.wunder.getAlert(cities));
      promises.push(this.wunder.getForecast(cities));
    }

    Promise.all(promises).then(res => {

      //console.log(res);


      let digits = new Digits(res[0].temp.split(' ')[0], {
        on: chalk.green('\u25a0'),
        off: chalk.green.dim('\u2b1a')
      });

      cui.div(
        {
          text: chalk.red(res[0].city) + chalk.white(' (' + res[0].elevation + ')') + '\n' + chalk.blue(res[0].station_city) + '\n' + chalk.dim(res[0].time),
          padding: [2,2,0,2]
        }
      );

      cui.div(
        {
          text: digits.rendered(),
          padding: [ 2, 2, 2, 2],
          width: 'auto'
        },
        {
          text: res[0].temp.split(' ')[1],
          padding: [2, 2, 2, 0]
        }
      );

      console.log(cui.toString());


    }).catch(err => {
      console.error(err);
    });

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


  /**
   * Shows all alerts of a city
   * 
   * @param {Int} id 
   * @memberof UI
   */
  alert(id) {

    if (!id) {
      console.error(new Error('Please specify a city ID').message);
    } else {
      this.wunder.getAlert(this.cfg.data.cities[id - 1]).then(res => {

        console.log(chalk.white('\nThere are %s Alerts:\n'), res.length);
        for (var i = 0; i < res.length; i++) {
          let alert = res[i];

          console.log('%s %s', alert.significance, chalk.green(alert.phenomena));
          console.log(chalk.dim(alert.description));
          console.log('Begins: %s', chalk.yellow(alert.date));
          console.log('Ends: %s', chalk.yellow(alert.expires));

          console.log('\n');
        }
      }).catch(err => {
        console.error(err.message);
      });
    }
  }


  /**
   * Shows forcast data for a city with a given count of days
   * 
   * @param {Int} id 
   * @param {Object} options 
   * @memberof UI
   */
  forecast(id, options) {

    if (!id) {
      console.error(new Error('You should specify a city ID').message);
    } else {

      this.wunder.getForecast(this.cfg.data.cities[id - 1]).then(res => {

        let count = (options.days && options.days <= 10) ? options.days : res.length;
        console.log('\nThe forecast for the next %s days in %s:\n', count, chalk.yellow(this.cfg.data.cities[id - 1].name));
        for (var i = 0; i < count; i++) {

          console.log(chalk.red(res[i].date));
          console.log(chalk.dim(res[i].conditions) + '\n');
          console.log('High: %s\t\tLow: %s\t\tWind: %s', chalk.yellow(res[i].high), chalk.yellow(res[i].low), chalk.yellow(res[i].wind));
          console.log('Rain: %s\t\tSnow: %s\t\tHumidity: %s\n\n', chalk.yellow(res[i].rain), chalk.yellow(res[i].snow), chalk.yellow(res[i].humidity));
        }
      }).catch(err => {
        console.error(err.message);
      });
    }
  }


}

module.exports = UI;