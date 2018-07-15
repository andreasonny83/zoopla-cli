const path = require('path');
require('dotenv').config({path: path.resolve(process.cwd(), '.test.env')});

const { Directions } = require('../lib//directions');

describe('Directions', () => {
  let directions;

  beforeEach(() => {
    jest.resetAllMocks();
    directions = new Directions();
  });

  it('calculateCyclingTimes should accept an array op positions', async () => {
    // Arrange
    const expected = {};

    // Act
    const response = await directions.calculateCyclingTimes();

    // Assert
    expect(response).toEqual(expected);
  });
});
