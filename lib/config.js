'use strict';

const Promise = require('promise');
const inquirer = require('inquirer');
const fs = require('fs');

class Config {

  constructor() {
    this.file = __dirname + '/../config.json';
    this.data = JSON.parse(fs.readFileSync(this.file));
  }

  saveKey(key) {

    let questions = [];

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

  }
}

module.exports = Config;