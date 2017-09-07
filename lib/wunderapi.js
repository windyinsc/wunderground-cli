'use strict';

const Promise = require('promise');
const Config = require('./config');
const got = require('got');
const chalk = require('chalk');

class WunderAPI {

  constructor(key) {

    this.cfg = new Config();
    this.key = key;
    this.data = {};
  }

  /**
   * Searches the API for a city
   * 
   * @param {String} name 
   * @returns {Promise} cities
   * @memberof WunderAPI
   */
  searchCity(name) {

    let query = 'http://autocomplete.wunderground.com/aq?query=' + name;

    return new Promise((resolve, reject) => {

      got(query).then(res => {

        this.data = JSON.parse(res.body).RESULTS;
        if (this.data.length === 0) {
          reject(new Error('Nothing found!'));
        } else {

          let cities = [];
          for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].type === 'city') {
              cities.push({
                name: this.data[i].name,
                value: i,
                station: this.data[i].zmw
              });
            }
          }
          resolve(cities);
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

  compileWeather(data) {

    let weather = {};

    weather.city = data.display_location.full;
    weather.station_city = data.observation_location.city;
    weather.time = data.observation_epoch;
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
      date: data.date.epoch,
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
