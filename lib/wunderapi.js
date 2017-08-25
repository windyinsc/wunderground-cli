'use strict';

const Promise = require('promise');
const inquirer = require('inquirer');
const got = require('got');

class WunderAPI {

  constructor(key) {

    this.key = key;
    this.acQuery = 'http://autocomplete.wunderground.com/aq?query=';
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

}

module.exports = WunderAPI;
