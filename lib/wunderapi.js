'use strict';

const Promise = require('promise');
const Config = require('./config');
const inquirer = require('inquirer');
const got = require('got');
const chalk = require('chalk');

class WunderAPI {

  constructor(key) {

    this.cfg = new Config();
    this.key = key;
    this.acQuery = 'http://autocomplete.wunderground.com/aq?query=';
    this.wQuery = 'http://api.wunderground.com/api/' + this.key + '/conditions/q/zmw:';
    this.data = {};
  }

  searchCity(name) {

    let cities = [];
    let choices = [];
    
    this.acQuery += name;

    return new Promise((resolve, reject) => {

      got(this.acQuery).then(res => {

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

      let query = this.wQuery + city.station + '.json';

      got(query).then(res => {
        if (res.statusCode !== 200) reject(new Error('Bad Status Code!'));

        this.data = JSON.parse(res.body).current_observation;
        resolve(this.compileData(this.data));

      }).catch(err => {
        reject(err);
      });

    });
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

  compileData(data) {

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

}

module.exports = WunderAPI;
