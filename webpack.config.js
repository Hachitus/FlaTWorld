var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    './src/bundle'
  ],
  output: {
    path: './tests/dist',
    filename: 'flatworld.js',
    libraryTarget: "umd",
    library: 'flatworld',
    UmdNamedDefine: true
  },
  node: {
    fs: "empty"
  },
  devtool: 'source-map',
  module: {
    preLoaders: [{
        test: /\.js?$/,
        exclude: [/node_modules/, /assets/],
        loader: 'eslint-loader',
        include: __dirname + '/src' 
      }
    ],
    loaders: [{
        test: /\.handlebars$/,
        loader: "handlebars-loader"
      }
    ]
  },
  debug: true
};