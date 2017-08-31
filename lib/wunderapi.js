'use strict';

const Promise = require('promise');
const Config = require('./config');
const inquirer = require('inquirer');
const got = require('got');
const moment = require('moment');
const chalk = require('chalk');
const asciify = require('asciify');
const size = require('window-size');
const ui = require('cliui');
const imageToAscii = require('image-to-ascii');

class WunderAPI {

  constructor(key) {

    this.cfg = new Config();
    this.key = key;
    this.data = {};
  }

  searchCity(name) {

    let cities = [];
    let query = 'http://autocomplete.wunderground.com/aq?query=' + name;

    return new Promise((resolve, reject) => {

      got(query).then(res => {

        this.data = JSON.parse(res.body).RESULTS;
        if (this.data.length === 0) reject(new Error('Nothing found!'));

        for (var i = 0; i < this.data.length; i++) {
          if (this.data[i].type === 'city') {
            cities.push({
              name: this.data[i].name,
              value: i,
              station: this.data[i].zmw
            });
          }
        }

        if (cities.length > 1) {
          inquirer.prompt({
            type: 'list',
            name: 'city',
            message: 'Which city are you looking for?',
            choices: cities
          }).then(r => {
            resolve(cities[r.city]);
          });
        } else {
          resolve(cities[0]);
        }

      }).catch(err => {
          reject(err);
      });
    });
  }

  getWeather(city) {

    return new Promise((resolve, reject) => {

      let query = 'http://api.wunderground.com/api/' + this.key + '/conditions/q/zmw:' + city.station + '.json';

      got(query).then(res => {
        if (res.statusCode !== 200) reject(new Error('Bad Status Code!'));

        this.data = JSON.parse(res.body).current_observation;
        resolve(this.compileWeather(this.data));

      }).catch(err => {
        reject(err);
      });

    });
  }

  getAlert(city) {

    return new Promise((resolve, reject) => {

      let query = 'http://api.wunderground.com/api/' + this.key + '/alerts/q/zmw:' + city.station + '.json';

      got(query).then(res => {
        if (res.statusCode !== 200) reject(new Error('Bad Status Code!'));

        this.data = JSON.parse(res.body).alerts
        
        let alerts = [];

        if (this.data.length > 0) {
          for (var i = 0; i < this.data.length; i++) {

            alerts.push(this.compileAlert(this.data[i]));
          }
        }
        
        resolve(alerts);
      }).catch(err => {
        reject(err);
      });
    });
  }

  getForecast(city) {

    return new Promise((resolve, reject) => {

      let query = 'http://api.wunderground.com/api/' + this.key + '/forecast10day/q/zmw:' + city.station + '.json';

      got(query).then(res => {

        this.data = JSON.parse(res.body).forecast.simpleforecast.forecastday;

        let days = [];

        for (var i = 0; i < this.data.length; i++) {
          
          days.push(this.compileForecast(this.data[i])); 
        }

        resolve(days);
      }).catch(err => {
        reject(err);
      });
    });
  }

  list(options) {

    console.log('\nYou have %s saved cities!', this.cfg.data.cities.length);
    for (var i = 0; i < this.cfg.data.cities.length; i++) {

      if (options.stations) {
        console.log(chalk.white((i + 1) + '. ') + chalk.green(this.cfg.data.cities[i].name) + chalk.dim(' (' + this.cfg.data.cities[i].station + ')'));
      } else {
        console.log(chalk.white((i + 1) + '. ') + chalk.green(this.cfg.data.cities[i].name));
      }
    }

  }

  now(data) {

    let promises = [];

    if (typeof data.length !== 'undefined') {
      for (var i = 0; i < data.length; i++) {
        promises.push(this.getWeather(data[i]));
      }
    } else {
      promises.push(this.getWeather(data));
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

  alert(id) {

    this.getAlert(this.cfg.data.cities[id - 1]).then(res => {

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

  forecast(id, days) {

    this.getForecast(this.cfg.data.cities[id - 1]).then(res => {

      let count = (days && days <= 10) ? days : res.length;
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

  compileWeather(data) {

    let weather = {};

    weather.city = data.display_location.full;
    weather.station_city = data.observation_location.city;
    weather.time = data.observation_time;
    weather.description = data.weather;
    weather.humidity = data.relative_humidity;

    if (this.cfg.data.units === 'metric') {

      weather.elevation = data.display_location.elevation + ' m';
      weather.wind = data.wind_kph + ' km/h ' + data.wind_dir;
      weather.pressure = data.pressure_mb + ' mBar';
      weather.visibility = data.visibility_km + ' km';
    } else if (this.cfg.data.units === 'imperial') {

      weather.elevation = Math.round(1 / 0.3048 * parseInt(data.display_location.elevation)) + ' ft';
      weather.wind = data.wind_mph + ' mph ' + data.wind_dir;
      weather.pressure = data.pressure_in + ' in';
      weather.visibility = data.visibility_mi + ' mi';
    }

    if (this.cfg.data.temp === 'c') {

      weather.temp = data.temp_c + ' °C';
      weather.feels = data.feelslike_c + ' °C';
      weather.dewpoint = data.dewpoint_c + ' °C';
    } else if (this.cfg.data.temp === 'f') {

      weather.temp = data.temp_f + ' °F';
      weather.feels = data.feelslike_f + ' °F';
      weather.dewpoint = data.dewpoint_f + ' °F';
    }

    return weather;
  }

  compileAlert(data) {

    const tp = {
      'HUR': 'Hurricane Local Statement',
      'TOR': 'Tornado Warning',
      'TOW': 'Tornado Watch',
      'WRN': 'Severe Thunderstorm Warning',
      'SEW': 'Severe Thunderstorm Watch',
      'WIN': 'Winter Weather Advisory',
      'FLO': 'Flood Warning',
      'WAT': 'Flood Watch / Statement',
      'WND': 'High Wind Advisory',
      'SVR': 'Severe Weather Statement',
      'HEA': 'Heat Advisory',
      'FOG': 'Dense Fog Advisory',
      'SPE': 'Special Weather Statement',
      'FIR': 'Fire Weather Advisory',
      'VOL': 'Volcanic Activity Statement',
      'HWW': 'Hurricane Wind Warning',
      'REC': 'Record Set',
      'REP': 'Public Reports',
      'PUB': 'Public Information Statement'
    };

    const ph = {
      'HU': 'Hurricane',
      'FL': 'Flood',
      'FF': 'Flash Flood'
    };

    const sg = {
      'A': chalk.white.bgRed('Alert'),
      'W': chalk.black.bgYellow('Warning'),
      'S': chalk.black.bgGreen('Statement')
    }




    let alert = {
      type: tp[data.type] || data.type,
      description: data.description,
      date: data.date,
      expires: data.expires,
      phenomena: ph[data.phenomena] || data.phenomena,
      significance: sg[data.significance] || data.significance
    };

    return alert;
  }

  compileForecast(data) {

    let forecastday = {
      date: data.date.pretty,
      conditions: data.conditions,
      icon: data.icon_url,
      high: (this.cfg.data.temp === 'c') ? data.high.celsius + ' °C' : data.high.fahrenheit + ' °F',
      low: (this.cfg.data.temp === 'c') ? data.low.celsius + ' °C' : data.low.fahrenheit + ' °F',
      rain: (this.cfg.data.units === 'metric') ? data.qpf_allday.mm + ' mm' : data.qpf_allday.in + ' in',
      snow: (this.cfg.data.units === 'metric') ? data.snow_allday.cm + ' cm' : data.snow_allday.in + ' in',
      wind: (this.cfg.data.units === 'metric') ? data.avewind.kph + ' km/h ' + data.avewind.dir : data.avewind.mph + ' mph ' + data.avewind.dir,
      humidity: data.avehumidity
    };

    return forecastday;
  }

}

module.exports = WunderAPI;
