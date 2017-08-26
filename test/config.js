'use strict';

const test = require('ava');
const Config = require('../lib/config');


test('load default configuration file', t => {
  const cfg = new Config();

  t.is(typeof (cfg.data), 'object');
  t.is(typeof (cfg.data.apikey), 'string');
  t.is(typeof (cfg.data.units), 'string'); 
  t.is(typeof (cfg.data.temp), 'string');
  t.is(typeof (cfg.data.cities), 'object');

});

test.todo ('try loading non-existant configuration file');
test.todo ('try checking city data');