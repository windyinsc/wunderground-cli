'use strict';

const Promise = require('promise');
const rp = require('app-root-path');
const fs = require('fs-extra');

class Config {


  constructor() {
    this.file = rp + '/config.json';

    // Checks if config.json exists und copies the default one if nessecary
    if (!fs.existsSync(this.file)) fs.copySync(rp + '/config.default.json', this.file);

    this.data = JSON.parse(fs.readFileSync(this.file));
  }


  /**
   * Saves one or multiple keys and their properties in the config file
   * 
   * @param {any} object 
   * @returns {Promise} object
   * @memberof Config
   */
  saveKeys(object) {

    return new Promise((resolve, reject) => {
      
      if (!this.data) {
        reject(new Error('Data not assigned'));
      } else {

        for (var key in object) {

          if (object.hasOwnProperty(key) && key !== 'cities') this.data[key] = object[key];
        }

        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        resolve(object);
      }
    });
  }


  /**
   * Saves a city in the config file
   * 
   * @param {Object} data 
   * @returns {Promise} data
   * @memberof Config
   */
  saveCity(data) {

    return new Promise((resolve, reject) => {

      if (!this.cityExists(data.name)) {
        this.data.cities.push({
          name: data.name,
          station: data.station
        });
        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        resolve(data);
      } else {
        reject(new Error('City already saved!'));
      }
    });    
  }


  /**
   * Deletes a city by a given ID
   * 
   * @param {Int} id 
   * @returns {Promise} city
   * @memberof Config
   */
  deleteCity(id) {

    return new Promise((resolve, reject) => {

      let city = this.data.cities[id - 1];

      if(!this.cityExists(city.name)) {
        reject(new Error('City not found!'));
      } else {
        this.data.cities.splice(id - 1, 1);
        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        resolve(city);
      }
    });
  }


  /**
   * Checks if the City already exists in the config file
   * 
   * @param {String} name 
   * @memberof Config
   */
  cityExists(name) {

    let exists = false;

    this.data.cities.find((o, i) => {
      if (o.name === name) {
        exists = i + 1;
      }
    });
    
    return exists;
  }

}

module.exports = Config;