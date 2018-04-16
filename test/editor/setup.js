const webpack = require('webpack');
const config = require('./app/webpack.config');
const setupPuppeteer = require('jest-environment-puppeteer/setup');

module.exports = () => new Promise((resolve, reject) => {
  webpack(config, err => {
    if (err) {
      reject(err);
    }

    resolve();
  });
}).then(setupPuppeteer);