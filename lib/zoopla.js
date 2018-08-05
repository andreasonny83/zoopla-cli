// Copyright (c) 2018 AndreaSonny <andreasonny83@gmail.com> (https://github.com/andreasonny83)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const axios = require('axios');
const { log } = require('./helper');

module.exports.Zoopla = class Zoopla {
  constructor(config) {
    this.config = config;
    this.storedData = { listing: [] };
  }

  async fetchProperties(
    pageSize = 100,
    maxCallsPerSession = 100,
    keywords,
    distance,
    mostRecentFirst = true
  ) {
    const httpParams = {
      area: 'london',
      minimum_beds: 2,
      ...{ keywords },
      page_size: pageSize,
      page_number: 1,
      listing_status: 'sale',
      maximum_price: '450000',
      api_key: this.config.zooplaAPIKey,
      order_by: 'age',
      ordering: mostRecentFirst ? 'descending' : 'ascending',
    };

    log(`START`);

    let initialCall;

    try {
      initialCall = await axios.get(this.config.propertyListing, {
        params: httpParams,
      });
    } catch (err) {
      console.error((err.response && err.response.data) || err);
      return;
    }

    if (
      initialCall == undefined ||
      !initialCall.data ||
      !initialCall.data.result_count
    ) {
      log('No results available.', true);
      return;
    }

    this.storedData = this.updateData(this.storedData, initialCall.data, 1);

    const totalPages = this.getTotalPages(initialCall.data, pageSize);
    log(`${totalPages} pages found. Starting querying process.`);
    const calls = this.getAllPagesUrls(
      this.config.propertyListing,
      httpParams,
      totalPages,
      maxCallsPerSession - 1
    );

    for (const call of calls) {
      let res;

      try {
        res = await this.getPageData(call.url, call.params);
      } catch (err) {
        console.error((err.response && err.response.data) || err);
      }

      if (res && res.data) {
        log(`Page ${call.params.page_number} completed.`);
        this.storedData = this.updateData(
          this.storedData,
          res.data,
          call.params.page_number
        );
      } else {
        log('WRONG ANSWER', true);
        log(res, true);
        continue;
      }
    }

    log('END');

    return { ...this.storedData, distanceTarget: distance };
  }

  async getPageData(baseUrl, httParams) {
    return axios.get(baseUrl, { params: httParams });
  }

  getTotalPages(data, pageSize) {
    if (!data['result_count']) {
      throw new Error('Missing result_count in the response.');
    }

    const totalMatches = data['result_count'];
    const totalPages = Math.ceil(totalMatches / pageSize);

    return totalPages;
  }

  getAllPagesUrls(
    baseUrl,
    httpParams,
    totalPages,
    maxCallsPerSession,
    calls = []
  ) {
    if (!totalPages) {
      throw new Error('totalPages missing or empty.');
    }

    const currentPage = calls.length + 2;

    if (calls.length >= totalPages - 1 || calls.length >= maxCallsPerSession) {
      return calls;
    }

    const newCalls = [
      ...calls,
      {
        url: baseUrl,
        params: {
          ...httpParams,
          page_number: currentPage,
        },
      },
    ];

    return this.getAllPagesUrls(
      baseUrl,
      httpParams,
      totalPages,
      maxCallsPerSession,
      newCalls
    );
  }

  updateData(storedData, newData, pageNumber = 1) {
    const newStoredData = {
      ...storedData,
      ...newData,
      listing: [...storedData.listing, ...newData.listing],
      page_number: pageNumber,
    };

    return newStoredData;
  }
};
