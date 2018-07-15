// Copyright (c) 2018 AndreaSonny <andreasonny83@gmail.com> (https://github.com/andreasonny83)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const fs = require('fs');
const { log } = require('./helper');

module.exports.Directions = class Directions {
  constructor(config) {
    this.config = config;
  }

  calculateCyclingTimes(positions) {
    log();
    return {};
  }
}
