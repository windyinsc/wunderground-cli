'use strict';

const test = require('ava');
const rp = require('app-root-path');
const Config = require(rp + '/lib/config');


var input = {
  name: 'Buxtehude, Germany',
  value: 0,
  station: '00000.223.10149'
};
var id;

test('load default configuration file', t => {
  const cfg = new Config();

  t.is(typeof (cfg.data), 'object');
  t.is(typeof (cfg.data.apikey), 'string');
  t.is(typeof (cfg.data.units), 'string'); 
  t.is(typeof (cfg.data.temp), 'string');
  t.is(typeof (cfg.data.cities), 'object');

});

test('save a city to the config', t => {
  const cfg = new Config();
  let cityCount = cfg.data.cities.length;

  return cfg.saveCity(input).then(res => {

    t.is(cfg.data.cities.length, cityCount + 1);
    t.is(typeof(res), 'object');
    t.is(res, input);
  });
});

test('check if the city already exists', t => {
  const cfg = new Config();

  let res = cfg.cityExists(input.name);
  t.is(typeof(res), 'number');
  id = res;
});

test('get error while saving city twice', t => {
  const cfg = new Config();

  return cfg.saveCity(input).catch(err => {

    t.is(err.message, 'City already saved!');
  });
});

test('delete the same city from the config', t => {
  const cfg = new Config();
  const cityCount = cfg.data.cities.length;

  return cfg.deleteCity(id).then(res => {

    t.is(typeof(res), 'object');
    t.is(res.cities.length, cityCount - 1);
  });

});

