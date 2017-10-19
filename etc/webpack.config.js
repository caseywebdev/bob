const {env} = process;
const path = require('path');
const webpack = require('webpack');

const MINIFY = env.MINIFY === '1';

module.exports = {
  entry: path.resolve('src/client/index.js'),
  output: {
    path: path.resolve('build/client'),
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
        use: [
          {
            loader: 'babel-loader',
            options: {presets: ['env', 'stage-0', 'react']}
          }
        ]
      }
    ]
  },
  plugins: [].concat(MINIFY ? new webpack.optimize.UglifyJsPlugin() : [])
};
