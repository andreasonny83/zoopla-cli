const fs = require('fs');
const { Helper, log, error } = require('../lib/helper');

jest.mock('fs');

describe('Helper', () => {
  describe('fetchReport', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      fs.readFile = jest.fn();
    });

    it('fetchReport should return the stored json report', async () => {
      // Arrange
      const expected = { data: 'mock' };

      fs.readFile.mockImplementation((fileName, format, cb) =>
        cb(null, JSON.stringify(expected))
      );

      // Act
      const response = await Helper.fetchReport('123');

      // Assert
      expect(response).toEqual(expected);
    });
  });

  describe('log', () => {
    const env = process.env.NODE_ENV;

    beforeEach(() => jest.resetAllMocks());
    afterEach(() => (process.env.NODE_ENV = env));

    it('should force a message to be print', () => {
      // Arrange
      jest.spyOn(console, 'log').mockImplementation(() => {});
      let currentTime;

      // Act
      currentTime = new Date().toLocaleTimeString();
      log('test', true);

      // Assert
      expect(console.log).toHaveBeenCalledWith(`[${currentTime}]: test`);
    });

    it(`should print the message if the environment is equal to 'development'`, () => {
      // Arrange
      process.env.NODE_ENV = 'development';

      // Act
      log('test');

      // Assert
      expect(console.log).toHaveBeenCalled();
    });

    it(`should not print the message if the environment is different from 'development'`, () => {
      // Arrange
      jest.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      log('test');

      // Assert
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('Error', () => {
    it(`should print an error message`, () => {
      // Arrange
      const currentTime = new Date().toLocaleTimeString();
      const expectedMessage = `[${currentTime}]: test`;
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      error('test', true);

      // Assert
      expect(console.error).toHaveBeenCalledWith(expectedMessage);
    });
  });
});
