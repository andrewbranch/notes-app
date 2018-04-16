const path = require('path');

module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
  },
  server: {
    command: 'npm run serve-test-editor',
    port: parseInt(process.env.PORT, 10) || 51423,
  }
}