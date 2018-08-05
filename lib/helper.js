// Copyright (c) 2018 AndreaSonny <andreasonny83@gmail.com> (https://github.com/andreasonny83)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

module.exports.Helper = class Helper {
  static async fetchReport(reportName) {
    const file = path.resolve(__dirname, `../reports/${reportName}.json`);
    const readFile = promisify(fs.readFile);
    let report;

    try {
      report = await readFile(file, 'utf8');
    } catch (err) {
      console.error(err);
      return;
    }

    return JSON.parse(report);
  }
};

module.exports.log = (msg, force = false) => {
  const DEBUG =
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG === 'true' ||
    force === true;

  if (DEBUG === true) {
    if (typeof msg === 'object') {
      console.group();
      console.log(`[${new Date().toLocaleTimeString()}]`);
      console.dir(msg);
      console.groupEnd();
      return;
    }

    console.log(`[${new Date().toLocaleTimeString()}]: ${msg}`);
  }
};

module.exports.error = (msg, force = false) => {
  const DEBUG =
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG === 'true' ||
    force === true;

  if (DEBUG === true) {
    if (typeof msg === 'object') {
      console.group();
      console.error(`[${new Date().toLocaleTimeString()}]`);
      console.dir(msg);
      console.groupEnd();
      return;
    }

    console.error(`[${new Date().toLocaleTimeString()}]: ${msg}`);
  }
};
