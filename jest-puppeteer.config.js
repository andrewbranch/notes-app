const path = require('path');

module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
    noSandbox: process.env.TRAVIS
  }
}