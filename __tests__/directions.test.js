const axios = require('axios');
const { Directions } = require('../lib/directions');
const { log, error } = require('../lib/helper');

jest.mock('../lib/helper');

describe('Directions', () => {
  let directions;
  const mockAPIConfig = {
    propertyListing: 'http://mock.api/v1/list.json',
    zooplaAPIKey: 'mockAPIKey',
    googleMapsKey: 'mockGoogleMapsKey',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    axios.get = jest.fn();

    directions = new Directions(mockAPIConfig);
  });

  it('calculateCyclingTimes should accept an array op positions', async () => {
    // Arrange
    const expected = {};

    // Act
    const response = await directions.calculateCyclingTimes();

    // Assert
    expect(response).toEqual(expected);
  });

  it('calculateCyclingTimes should make an http request to GoogleMaps', async () => {
    // Arrange
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: {} }));

    const baseUrl = 'https://maps.googleapis.com/maps/api/directions/json?';
    const expected = { distance: 'Not found', duration: 'Not found' };

    // Act
    const response = await directions.calculateCyclingTimes(
      { latitude: 51.48, longitude: 0.27 },
      { latitude: 51.51, longitude: 0.08 }
    );

    // Assert
    expect(axios.get).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${baseUrl}key=${
        mockAPIConfig.googleMapsKey
      }&mode=bicycling&origin=51.48,0.27&destination=51.51,0.08`
    );
    expect(response).toEqual(expected);
  });

  it('the response from the http request should contain a data object', async () => {
    // Arrange
    log.mockImplementation(() => {});
    error.mockImplementation(() => {});

    const position = [
      { latitude: 51.48, longitude: 0.27 },
      { latitude: 51.51, longitude: 0.08 },
    ];

    axios.get
      .mockRejectedValueOnce(new Error('Async error'))
      .mockImplementationOnce(() => Promise.resolve())
      .mockImplementationOnce(() => Promise.resolve({ data: null }))
      .mockImplementationOnce(() => Promise.resolve({ data: {} }));

    // Act
    await directions.calculateCyclingTimes(position[0], position[1]);
    await directions.calculateCyclingTimes(position[0], position[1]);
    await directions.calculateCyclingTimes(position[0], position[1]);
    await directions.calculateCyclingTimes(position[0], position[1]);

    // Assert
    expect(axios.get).toHaveBeenCalledTimes(4);
    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenNthCalledWith(1, 'Ops! Cannot calculate distance.');
    expect(log).toHaveBeenNthCalledWith(2, 'Ops! Cannot calculate distance.');
    expect(error).toHaveBeenNthCalledWith(1, Error('Async error'));
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('the response from the http request should contain a distance and duration', async () => {
    // Arrange
    const expectedDistance = { text: '3.9 km' };
    const expectedDuration = { text: '16 mins' };
    axios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          routes: [
            {
              legs: [
                {
                  distance: expectedDistance,
                  duration: expectedDuration,
                },
              ],
            },
          ],
        },
      })
    );

    const position = [
      { latitude: 51.48, longitude: 0.27 },
      { latitude: 51.51, longitude: 0.08 },
    ];

    // Act
    const result = await directions.calculateCyclingTimes(
      position[0],
      position[1]
    );

    // Assert
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      distance: expectedDistance.text,
      duration: expectedDuration.text,
    });
  });
});
