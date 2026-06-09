const { join } = require('path');

module.exports = {
  testDir: join(__dirname),
  testMatch: '**/*.test.js',
  outputDir: join(__dirname, '.output'),
  use: {
    baseURL: '',
  },
};
