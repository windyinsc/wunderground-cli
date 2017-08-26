'use strict';

const test = require('ava');
const rp = require('app-root-path');
const WunderAPI = require(rp + '/lib/wunderapi');

test('search for a city', t => {
  let wunder = new WunderAPI();

  return wunder.searchCity('buxtehude').then(res => {
    t.is(typeof(res), 'object');
    t.is(res.name, 'Buxtehude, Germany');
    t.is(res.value, 0);
    t.is(res.station, '00000.223.10149');
  });
});

