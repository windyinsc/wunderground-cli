'use strict';


class Digits {

  constructor(number, options) {

    this.on = (options && options.on) ? options.on : '\u25a0';
    this.off = (options && options.off) ? options.off : '\u2b1a';
    this.offset = (options && options.offset) ? options.offset : '';
    this.space_between = (options && options.space_between) ? options.space_between : '  ';
    this.spacer = (options && options.spacer) ? options.spacer : ' ';
    this.number = parseFloat(number).toFixed(1);
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

      if (isNaN(parseInt(this.digits[i]))) {
        // Not a number
        line += this.space_between + this.getDigit(10, n);
      } else {
        line += (i === 0) ? this.offset + this.getDigit(this.digits[i], n) : this.space_between + this.getDigit(this.digits[i], n);
      }
    }

    return line;
  }

  getDigit(n, line) {

    const matrix = [
      [
        1, 1, 1,
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,
        1, 1, 1
      ],
      [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ],
      [
        1, 1, 1,
        0, 0, 1,
        1, 1, 1,
        1, 0, 0,
        1, 1, 1
      ],
      [
        1, 1, 1,
        0, 0, 1,
        1, 1, 1,
        0, 0, 1,
        1, 1, 1
      ],
      [
        1, 0, 1,
        1, 0, 1,
        1, 1, 1,
        0, 0, 1,
        0, 0, 1
      ],
      [
        1, 1, 1,
        1, 0, 0,
        1, 1, 1,
        0, 0, 1,
        1, 1, 1
      ],
      [
        1, 1, 1,
        1, 0, 0,
        1, 1, 1,
        1, 0, 1,
        1, 1, 1
      ],
      [
        1, 1, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ],
      [
        1, 1, 1,
        1, 0, 1,
        1, 1, 1,
        1, 0, 1,
        1, 1, 1
      ],
      [
        1, 1, 1,
        1, 0, 1,
        1, 1, 1,
        0, 0, 1,
        1, 1, 1
      ],
      [
        0,
        0,
        0,
        0,
        1
      ]
    ];

    let output = '';
    
    // Commata
    if (n === 10) {
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