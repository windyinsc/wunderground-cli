'use strict';

const Promise = require('promise');
const Wunder = require('./wunderapi');
const Config = require('./config');
const Digits = require('./digits');
const inquirer = require('inquirer');
const moment = require('moment');
const chalk = require('chalk');
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

  settings() {

    console.log('\r');
    inquirer.prompt([
      {
        type: 'list',
        name: 'units',
        message: 'Which system of measurement do you prefer?',
        choices: [
          {
            name: 'Metric',
            value: 'metric'
          },
          {
            name: 'Imperial',
            value: 'imperial'
          }
        ],
        default: this.cfg.data.units
      },
      {
        type: 'list',
        name: 'temp',
        message: 'Which temperature scale do you prefer?',
        choices: [
          {
            name: 'Celsius',
            value: 'c'
          },
          {
            name: 'Fahrenheit',
            value: 'f'
          }
        ],
        default: this.cfg.data.temp
      }
    ]).then(res => {

      if (res.units !== this.cfg.data.units || res.temp !== this.cfg.data.temp) {
        this.cfg
          .saveKeys(res)
          .then(res2 =>
            console.log("\nYour settings are successfully saved.\n")
          )
          .catch(err => console.error(err.message));
      }
    });
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
   * Shows the weather, alerts and forecast for one city right now
   * 
   * @param {Int} id 
   * @memberof UI
   */
  now(id) {

    let promises = [];
    let cities = (!id) ? this.cfg.data.cities[0] : this.cfg.data.cities[id - 1];

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

      let digits = new Digits(res[0].temp.split(' ')[0], {
        on: chalk.green('\u25a0'),
        off: chalk.green.dim('\u2b1a'),
        max_digits: (this.cfg.data.temp === 'c') ? 2 : 3,
        max_decimals: (this.cfg.data.temp === 'c') ? 1 : 0,
        leading: ' '
      });

      let alerts = '';
      if (res[1]) {
        for (let i = 0; i < res[1].length; i++) {

          alerts += res[1][i].significance + ' ' + chalk.green(res[1][i].phenomena) + '\n' + chalk.dim(res[1][i].description) + '\n\n';
        }
      }

      cui.div(
        {
          text: chalk.red(res[0].city) + chalk.white(' (' + res[0].elevation + ')') + '\n' + chalk.blue(res[0].station_city) + '\n' + chalk.dim('Last updated on ' + moment.unix(res[0].time).format('MMMM D, hh:mm A')) + '\n' + chalk.green(res[0].description),
          padding: [2, 2, 0, 2]
        }
      );

      cui.div(
        {
          text: digits.rendered(),
          padding: [2, 2, 0, 2],
          width: 'auto'
        },
        {
          text: res[0].temp.split(' ')[1],
          padding: [2, 2, 0, 0],
          width: 8
        },
        {
          text: 'Feels like:\nHumidity:\nDewpoint:\nPressure:\nWind:',
          padding: [2, 2, 0, 2],
          width: 16
        },
        {
          text: chalk.yellow(res[0].feels) + '\n' + chalk.yellow(res[0].humidity) + '\n' + chalk.yellow(res[0].dewpoint) + '\n' + chalk.yellow(res[0].pressure) + '\n' + chalk.yellow(res[0].wind),
          padding: [2, 2, 0, 0],
          width: 18
        },
        {
          text: alerts,
          padding: [2, 2, 0, 0]
        }
      );

      cui.div(
        {
          text: chalk.yellow('Tomorrow') + '\n' + chalk.green(res[2][1].conditions),
          padding: [1, 2, 0, 2],
          width: 34
        },
        {
          text: chalk.yellow(moment.unix(res[2][2].date).format('MMMM D')) + '\n' + chalk.green(res[2][2].conditions),
          padding: [1, 2, 0, 2],
          width: 34
        },
        {
          text: chalk.yellow(moment.unix(res[2][3].date).format('MMMM D')) + '\n' + chalk.green(res[2][3].conditions),
          padding: [1, 2, 0, 2],
          width: 34
        }
      );

      cui.div(
        {
          text: 'Temperature:\nRain:\nWind',
          padding: [1, 0, 2, 2],
          width: 16
        },
        {
          text: chalk.yellow(res[2][1].high + ' / ' + res[2][1].low) + '\n' + chalk.yellow(res[2][1].rain) + '\n' + chalk.yellow(res[2][1].wind),
          padding: [1, 2, 2, 0],
          width: 18
        },
        {
          text: 'Temperature:\nRain:\nWind',
          padding: [1, 0, 2, 2],
          width: 16          
        },
        {
          text: chalk.yellow(res[2][2].high + ' / ' + res[2][2].low) + '\n' + chalk.yellow(res[2][2].rain) + '\n' + chalk.yellow(res[2][2].wind),
          padding: [1, 2, 2, 0],
          width: 18
        },
        {
          text: 'Temperature:\nRain:\nWind',
          padding: [1, 0, 2, 2],
          width: 16
        },
        {
          text: chalk.yellow(res[2][3].high + ' / ' + res[2][3].low) + '\n' + chalk.yellow(res[2][3].rain) + '\n' + chalk.yellow(res[2][3].wind),
          padding: [1, 2, 2, 0],
          width: 18
        }
      );


      console.log(cui.toString());


    }).catch(err => {
      console.error(err);
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

          console.log(chalk.red(moment.unix(res[i].date).format('MMMM D, YYYY')));
          console.log(chalk.dim(res[i].conditions) + '\n');
          console.log('High: %s\t\tLow: %s\t\tWind: %s', chalk.yellow(res[i].high), chalk.yellow(res[i].low), chalk.yellow(res[i].wind));
          console.log('Rain: %s\t\tSnow: %s\t\tHumidity: %s\n\n', chalk.yellow(res[i].rain), chalk.yellow(res[i].snow), chalk.yellow(res[i].humidity));
        }
      }).catch(err => {
        console.error(err.message);
      });
    }
  }

  test(str) {

    let digits = new Digits(str, {
      on: chalk.green('\u25a0'),
      off: chalk.green.dim('\u2b1a'),
      max_decimals: 1,
      max_digits: 3,
      leading: ' '
    });

    console.log(digits.rendered());
  }

}

module.exports = UI;