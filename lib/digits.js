'use strict';


class Digits {

  constructor(number, options) {

    this.on = (options && options.on) ? options.on : '\u25a0';
    this.off = (options && options.off) ? options.off : '\u2b1a';
    this.offset = (options && options.offset) ? options.offset : '';
    this.space_between = (options && options.space_between) ? options.space_between : '  ';
    this.spacer = (options && options.spacer) ? options.spacer : ' ';
    this.max_digits = (options && options.max_digits >= 0) ? options.max_digits : 2;
    this.max_decimals = (options && options.max_decimals >= 0) ? options.max_decimals : 1;
    this.leading = (options && options.leading) ? options.leading.toString() : '0';
    this.number = parseFloat(number.replace(',', '.')).toFixed(this.max_decimals).toString();
    
    const decimals = this.number.length - this.max_decimals - (this.number.match(/\./g) || []).length;
    if (this.max_digits > 0 && decimals - 1 < this.max_digits) {
      if (this.number[0] === '-' && this.leading !== ' ') {
        this.number = '-' + this.leading.repeat(this.max_digits - decimals) + this.number.replace('-', '');
      } else {
        this.number = this.leading.repeat(this.max_digits - decimals) + this.number;
      }
    }
    //console.log('%s => %s', number, this.number);
    
    this.digits = [];
    for (let i = 0; i < this.number.length; i++) {
      this.digits.push(this.number[i]);
    }
  }

  rendered() {

    let output = '';

    for (let i = 0; i < 5; i++) {

      output += this.getLine(i + 1) + '\n';  
    }

    return output;
  }

  getLine(n) {

    let line = '';

    for (let i = 0; i < this.digits.length; i++) {

      line += (i === 0) ? this.offset : this.space_between;
      line += this.getDigit(this.digits[i], n);

    }

    return line;
  }

  getDigit(n, line) {

    const matrix = {
      0:
      [
        1, 1, 1,
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,
        1, 1, 1
      ],
      1:
      [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ],
      2:
      [
        1, 1, 1,
        0, 0, 1,
        1, 1, 1,
        1, 0, 0,
        1, 1, 1
      ],
      3:
      [
        1, 1, 1,
        0, 0, 1,
        1, 1, 1,
        0, 0, 1,
        1, 1, 1
      ],
      4:
      [
        1, 0, 1,
        1, 0, 1,
        1, 1, 1,
        0, 0, 1,
        0, 0, 1
      ],
      5:
      [
        1, 1, 1,
        1, 0, 0,
        1, 1, 1,
        0, 0, 1,
        1, 1, 1
      ],
      6:
      [
        1, 1, 1,
        1, 0, 0,
        1, 1, 1,
        1, 0, 1,
        1, 1, 1
      ],
      7:
      [
        1, 1, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ],
      8:
      [
        1, 1, 1,
        1, 0, 1,
        1, 1, 1,
        1, 0, 1,
        1, 1, 1
      ],
      9:
      [
        1, 1, 1,
        1, 0, 1,
        1, 1, 1,
        0, 0, 1,
        1, 1, 1
      ],
      "-":
      [
        0, 0, 0,
        0, 0, 0,
        1, 1, 1,
        0, 0, 0,
        0, 0, 0
      ],
      " ":
      [
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
      ],
      ".":
      [
        0,
        0,
        0,
        0,
        1
      ]
    };

    let output = '';

    // Commata get only one row
    if (n === ".") {
      if (matrix[n][line - 1] === 1) {
        output += this.on;
      } else if (matrix[n][line - 1] === 0) {
        output += this.off;
      }
    } else {
      for (let i = (line - 1) * 3; i < ((line - 1) * 3) + 3; i++) {

        if (matrix[n][i] === 1) {
          output += (i === (line - 1) * 3) ? this.on : this.spacer + this.on;
        } else if (matrix[n][i] === 0) {
          output += (i === (line - 1) * 3) ? this.off : this.spacer + this.off;
        }
      }
    }

    return output;
  }


}

module.exports = Digits;