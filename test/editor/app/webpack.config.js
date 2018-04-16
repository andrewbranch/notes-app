// @ts-check
const path = require('path');
const webpack = require('webpack');
const HardSourcePlugin = require('hard-source-webpack-plugin');

/** @type {webpack.Configuration} */
const config = {
  context: __dirname,
  entry: './index.tsx',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: path.resolve(__dirname, '../../../app/tsconfig.json')
        }
      },
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      use: 'json-loader'
    }, {
      test: /\.global\.css$/,
      use: [
        'style-loader',
        'css-loader?sourceMap'
      ]
    },

    {
      test: /^((?!\.global).)*\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            sourceMap: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]___[hash:base64:5]',
            camelCase: 'only'
          }
        }
      ]
    },

    // Add SASS support  - compile all .global.scss files and pipe it to style.css
    {
      test: /\.global\.scss$/,
      use: [
        {
          loader: 'style-loader'
        },
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'sass-loader'
        }
      ]
    },
    // Add SASS support  - compile all other .scss files and pipe it to style.css
    {
      test: /^((?!\.global).)*\.scss$/,
      use: [
        {
          loader: 'style-loader'
        },
        {
          loader: 'css-loader',
          options: {
            modules: true,
            sourceMap: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]__[hash:base64:5]',
            camelCase: true
          }
        },
        {
          loader: 'sass-loader'
        }
      ]
    }]
  },

  output: {
    path: __dirname,
    filename: 'bundle.js'
  },

  target: 'web',

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json']
  },

  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /generateRandomKey/,
      path.resolve(__dirname, 'generateCounterKey.ts')
    ),
    new HardSourcePlugin()
  ]
};

module.exports = config;
