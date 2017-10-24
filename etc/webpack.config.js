const {env} = process;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const MINIFY = env.MINIFY === '1';

const extractSass = new ExtractTextPlugin({filename: 'index.css'});

module.exports = {
  entry: path.resolve('src/client/index.js'),
  output: {
    path: path.resolve('build'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve('src/client'),
          path.resolve('src/shared')
        ],
        use: {
          loader: 'babel-loader',
          options: {presets: ['env', 'stage-0', 'react']}
        }
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({use: ['css-loader', 'sass-loader']})
      }
    ]
  },
  plugins: [].concat(
    extractSass,
    new CopyWebpackPlugin([
      {
        from: path.resolve('src/client/public'),
        to: path.resolve('build')
      },
      {
        from: path.resolve('node_modules/font-awesome/fonts'),
        to: path.resolve('build/fonts')
      }
    ]),
    MINIFY ? new webpack.optimize.UglifyJsPlugin() : []
  )
};
