// Copyright (c) 2018 AndreaSonny <andreasonny83@gmail.com> (https://github.com/andreasonny83)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const fs = require('fs');
const { Zoopla } = require('./zoopla');
const { config } = require('./config');
const { Directions } = require('./directions');
const { log } = require('./helper');

const queries = [
  // [20, 1, 'garden'], // Use this for test only
  [100, 100, 'balcony', 30, true],
  [100, 100, 'garden', 40, true],
  [100, 100, 'balcony', 30, false],
  [100, 100, 'garden', 40, false],
];

module.exports = async () => {
  const myZoopla = new Zoopla(config);
  const directions = new Directions(config);

  const file = fs.createWriteStream(`./reports/${Date.now()}.json`, {
    flags: 'w',
    encoding: 'utf-8',
  });

  return myZoopla
    .fetchProperties(...queries[0])
    .then(async ({ distanceTarget, ...totalResults }) => {
      let storeResults = { ...totalResults };
      const listing = [...storeResults.listing];

      if (!distanceTarget) {
        return storeResults;
      }

      for (const [index, result] of totalResults.listing.entries()) {
        log(`fetching directions #${index}`);
        const res = await directions.calculateCyclingTimes(
          {
            latitude: result.latitude,
            longitude: result.longitude,
          },
          {
            latitude: 51.511026,
            longitude: -0.086579,
          }
        );

        const duration = /^(\d+) mins/gi.exec(res.duration);

        if (duration && duration[1] && duration[1] < distanceTarget) {
          listing[index] = {
            ...storeResults.listing[index],
            directions: res,
          };
        } else {
          listing[index] = undefined;
        }

        storeResults = {
          ...totalResults,
          listing,
        };
      }

      return storeResults;
    })
    .then((data) => {
      file.write(JSON.stringify(data, null, 2));
      file.end();
    });
};
