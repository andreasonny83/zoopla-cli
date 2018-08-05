// Copyright (c) 2018 AndreaSonny <andreasonny83@gmail.com> (https://github.com/andreasonny83)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const axios = require('axios');
const { log, error } = require('./helper');

module.exports.Directions = class Directions {
  constructor(config) {
    this.api = `https://maps.googleapis.com/maps/api/directions/json?key=${
      config.googleMapsKey
    }`;
  }

  /**
   * @param  {latitude: Number, longitude: Number} position
   * @param  {latitude: Number, longitude: Number} target
   */
  async calculateCyclingTimes(position, target) {
    if (
      !position ||
      !target ||
      !position.latitude ||
      !position.longitude ||
      !target.latitude ||
      !target.longitude
    ) {
      return {};
    }

    const origin = `${position.latitude},${position.longitude}`;
    const destination = `${target.latitude},${target.longitude}`;

    const response = await this.getDirections(
      `${this.api}&mode=bicycling`,
      origin,
      destination
    );

    return response;
  }

  async getDirections(reqURL, origin, destination) {
    const req = `${reqURL}&origin=${origin}&destination=${destination}`;
    let response;
    let distance = 'Not found';
    let duration = 'Not found';

    try {
      response = await axios.get(req);
    } catch (err) {
      error((err && err.response && err.response.data) || err);
      return { distance, duration };
    }

    if (!response || !response.data) {
      log('Ops! Cannot calculate distance.');
      return { distance, duration };
    }

    const legs =
      response.data.routes &&
      response.data.routes[0] &&
      response.data.routes[0].legs &&
      response.data.routes[0].legs[0];

    if (legs && legs.distance && legs.duration) {
      distance = legs.distance.text;
      duration = legs.duration.text;
    }

    return { distance, duration };
  }
};
