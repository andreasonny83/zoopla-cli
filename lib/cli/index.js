// Copyright (c) 2018 AndreaSonny <andreasonny83@gmail.com> (https://github.com/andreasonny83)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const { Zoopla } = require('../zoopla');
const { config } = require('../config');

module.exports = function() {
  const myZoopla = new Zoopla(config);

  return myZoopla.fetchProperties(1, 2);
}
