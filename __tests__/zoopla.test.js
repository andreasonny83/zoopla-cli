const axios = require('axios');
const fs = require('fs');

const { Zoopla } = require('../lib/zoopla');

jest.mock('axios');
jest.mock('fs');

describe('Zoopla', () => {
  const mockAPIConfig = {
    propertyListing: 'http://mock.api/v1/list.json',
    zooplaAPIKey: 'mockAPIKey',
  };
  let myZoopla;

  beforeEach(() => {
    myZoopla = new Zoopla(mockAPIConfig);
  });

  it(`getAllPagesUrls should return an array of urls with a length equal to the 'totalPages'`, () => {
    // Arrange
    const baseUrl = 'http://apiurl.com';

    // Act
    const response = myZoopla.getAllPagesUrls(baseUrl, {}, 100);

    // Assert
    expect(response.length).toEqual(99);
  });

  it(`The 'page_number' in each array item should increment from 1 to the 'totalPages'`, () => {
    // Arrange
    const baseUrl = 'http://apiurl.com';
    const httpParams = {
      page_number: 1,
    };

    // Act
    const response = myZoopla.getAllPagesUrls(baseUrl, httpParams, 100);

    // Assert
    expect(response[0].params['page_number']).toEqual(2);
    expect(response[1].params['page_number']).toEqual(3);
    expect(response[response.length - 1].params['page_number']).toEqual(100);
  });

  it('should retrive the total number of pages based on the page size and total reoults', () => {
    // Assert
    const mockData = {
      result_count: 999,
    };

    // Act
    const response10 = myZoopla.getTotalPages(mockData, 100);
    const response100 = myZoopla.getTotalPages(mockData, 10);

    // Assert
    expect(response10).toEqual(10);
    expect(response100).toEqual(100);
  });

  it('getAllPagesUrls the response should match the screenshot', () => {
    // Arrange
    const baseUrl = 'http://apiurl.com';
    const httpParams = {
      area: 'london',
      radius: 5,
      minimum_beds: 1,
      page_size: 100,
      page_number: 1,
      listing_status: 'sale',
      maximum_price: '450000',
      api_key: 'abc123',
    };

    // Act
    const response = myZoopla.getAllPagesUrls(baseUrl, httpParams, 100);

    // Assert
    expect(response.length).toEqual(99);
    expect(response[0].params['page_number']).toEqual(2);
    expect(response[98].params['page_number']).toEqual(100);
    expect(response).toMatchSnapshot();
  });

  describe('fetchProperties', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      axios.get
        .mockImplementationOnce(() => ({
          data: {
            result_count: 201,
            listing: [],
          },
        }))
        .mockImplementation((_, { params }) => ({
          data: {
            page_number: params.page_number,
            listing: [],
          },
        }));

      fs.createWriteStream = jest.fn(() => ({
        write: jest.fn(),
        end: jest.fn(),
      }));
    });

    it('should make an inial call to the API', async () => {
      // Arrange
      const httParams = {
        area: 'london',
        radius: 0.1,
        api_key: 'mockAPIKey',
        listing_status: 'sale',
        maximum_price: '450000',
        keywords: 'garden',
        minimum_beds: 2,
        page_number: 1,
        page_size: 1,
      };

      // Act
      await myZoopla.fetchProperties(1, 1);

      // Assert
      expect(axios.get).toHaveNthReturnedWith(1, {
        data: {
          result_count: 201,
          listing: [],
        },
      });
      expect(axios.get).toHaveBeenNthCalledWith(1, mockAPIConfig.propertyListing, {
        params: httParams,
      });
    });

    it('should make an API call for each page', async () => {
      // Arrange
      const httParams = {
        area: 'london',
        radius: 0.1,
        api_key: 'mockAPIKey',
        listing_status: 'sale',
        maximum_price: '450000',
        keywords: 'garden',
        minimum_beds: 2,
        page_number: 1,
        page_size: 100,
      };

      // Act
      await myZoopla.fetchProperties();

      // Assert
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(axios.get).toHaveBeenNthCalledWith(1, mockAPIConfig.propertyListing, {
        params: {
          ...httParams,
          page_number: 1,
        },
      });
      expect(axios.get).lastCalledWith(mockAPIConfig.propertyListing, {
        params: {
          ...httParams,
          page_number: 3,
        },
      });
      expect(axios.get).lastReturnedWith({
        data: {
          page_number: 3,
          listing: [],
        },
      });
    });

    it('should write to a file', async () => {
      // Act
      await myZoopla.fetchProperties();

      // Assert
      expect(fs.createWriteStream).toHaveBeenCalledTimes(1);
      expect(myZoopla.file.write).toHaveBeenCalledTimes(1);
      expect(myZoopla.file.end).toHaveBeenCalledTimes(1);
    });

    it(`should store a 'current_page' value inside the generated output`, async () => {
      // Arrange
      const expected = {
        listing: [],
        result_count: 201,
        page_number: 3,
      };

      // Act
      await myZoopla.fetchProperties();

      // Assert
      expect(myZoopla.file.write).toHaveBeenCalledWith(JSON.stringify(expected, null, 2));
    });

    it('should allow to pass a maximum number of calls per session', async () => {
      // Act
      await myZoopla.fetchProperties();

      // Asserrt
      expect(axios.get).toHaveBeenCalledTimes(3);
    });

    it('should allow to pass a maximum number of calls per session', async () => {
      // Arrange
      const maxCallsPerSession = 2;

      // Act
      await myZoopla.fetchProperties(100, maxCallsPerSession);

      // Asserrt
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('should allow to pass a pageSize', async () => {
      // Arrange
      const pageSize = 50;

      // Act
      await myZoopla.fetchProperties(pageSize);

      // Asserrt
      expect(axios.get).toHaveBeenCalledTimes(5);
    });
  });

  describe('storedData', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      let propertyID = 0;

      axios.get
        .mockImplementationOnce(() => ({
          data: {
            result_count: 5,
            listing: [{ property_id: ++propertyID }],
          },
        }))
        .mockImplementation((_, { params }) => ({
          data: {
            page_number: params.page_number,
            listing: [{ property_id: ++propertyID }],
          },
        }));

      fs.createWriteStream = jest.fn(() => ({
        write: jest.fn(),
        end: jest.fn(),
      }));
    });

    it(`should initialize an empty 'listing' array`, async () => {
      // Asserrt
      expect(myZoopla.storedData).toEqual({ listing: [] });
    });

    it(`should inject the new fetched 'listing' of property in between each call`, async () => {
      // Arrange
      const pageSize = 1;

      expect(myZoopla.storedData).toEqual({ listing: [] });

      // Act
      await myZoopla.fetchProperties(pageSize);

      // Asserrt
      expect(myZoopla.storedData.listing.length).toEqual(5);
      expect(myZoopla.storedData.listing[0]).toEqual({ property_id: 1 });
      expect(myZoopla.storedData.listing[1]).toEqual({ property_id: 2 });
    });
  });
});
