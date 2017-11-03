"use strict";

const test = require("ava");
const rp = require("app-root-path");
const Digits = require(rp + "/lib/digits");

test('Replace comma with dot', t => {
  let digits = new Digits('12,75', {
    on: '\u25a0',
    off: '\u2b1a',
    max_decimals: 2
  });

  t.is(typeof(digits.number), 'string');
  t.is(digits.number, '12.75');
});

test("Remain fixed decimals", t => {
  let digits = new Digits("14", {
    on: "\u25a0",
    off: "\u2b1a",
    max_decimals: 2
  });

  t.is(typeof digits.number, "string");
  t.is(digits.number, "14.00");
});

test("Remain fixed digits with leading whitespace", t => {
  let digits = new Digits("7.8", {
    on: "\u25a0",
    off: "\u2b1a",
    max_decimals: 1,
    max_digits: 2,
    leading: ' '
  });

  t.is(typeof digits.number, "string");
  t.is(digits.number, " 7.8");
});


test("Remain fixed digits with leading zeros", t => {
  let digits = new Digits("4.2", {
    on: "\u25a0",
    off: "\u2b1a",
    max_decimals: 1,
    max_digits: 2,
    leading: 0
  });

  t.is(typeof digits.number, "string");
  t.is(digits.number, "04.2");
});

test("Replace leading zero with minus when negative", t => {
  let digits = new Digits("-2.5", {
    on: "\u25a0",
    off: "\u2b1a",
    max_decimals: 1,
    max_digits: 2,
    leading: 0
  });


  t.is(typeof digits.number, "string");
  t.is(digits.number, "-2.5");
});

test("Get minus on the beginning when leading zeros", t => {
  let digits = new Digits("-2.5", {
    on: "\u25a0",
    off: "\u2b1a",
    max_decimals: 1,
    max_digits: 3,
    leading: 0
  });

  t.is(typeof digits.number, "string");
  t.is(digits.number, "-02.5");
});

test("Leave minus when leading whitespace", t => {
  let digits = new Digits("-2.5", {
    on: "\u25a0",
    off: "\u2b1a",
    max_decimals: 1,
    max_digits: 3,
    leading: ' '
  });

  t.is(typeof digits.number, "string");
  t.is(digits.number, " -2.5");
});


test("Integer without any decimals", t => {
  let digits = new Digits("28.96", {
    on: "\u25a0",
    off: "\u2b1a",
    max_decimals: 0,
    max_digits: 2,
    leading: 0
  });
  t.is(typeof digits.number, "string");
  t.is(digits.number, "29");
});

