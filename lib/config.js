'use strict';

const Promise = require('promise');
const inquirer = require('inquirer');
const rp = require('app-root-path');
const fs = require('fs-extra');

class Config {

  constructor() {
    this.file = rp + '/config.json';

    // Checks if config.json exists und copies the default one if nessecary
    if (!fs.existsSync(this.file)) fs.copySync(rp + '/config.default.json', this.file);

    this.data = JSON.parse(fs.readFileSync(this.file));
  }

  saveKey(key) {

    return new Promise((resolve, reject) => {
      
      if (!this.data) {
        reject(new Error('Data not assigned'));
      } 

      if (this.data.apikey !== '' && this.data.apikey !== key) {
        inquirer.prompt({
          type: 'confirm',
          name: 'overwrite',
          message: 'An API key already exists. Do you want to overwrite it?',
          default: false
        }).then(res => {
          
          if (!res.overwrite) {
            reject(new Error('As you wish!'));
          } else {
            this.data.apikey = key;
            fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
            resolve(this.data);
          }
        });
      } else if (this.data.apikey === key) {
        reject(new Error('You already have saved this API key.'));
      } else {
        this.data.apikey = key; 
        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        resolve(this.data);
      }
    });
  }

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

  deleteCity(id) {

    return new Promise((resolve, reject) => {

      if(!this.cityExists(this.data.cities[id - 1].name)) {
        reject(new Error('City not found!'));
      } else {
        this.data.cities.splice(id - 1, 1);
        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        resolve(this.data);
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