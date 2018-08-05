// Copyright (c) 2018 AndreaSonny <andreasonny83@gmail.com> (https://github.com/andreasonny83)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

require('dotenv').config();

module.exports.config = {
  propertyListing: 'https://api.zoopla.co.uk/api/v1/property_listings.json',
  directionsApi: 'https://maps.googleapis.com/maps/api/directions/json',
  zooplaAPIKey: process.env.ZOOPLA_API_KEY,
  googleMapsKey: process.env.GOOGLE_MAPS_KEY,
};
