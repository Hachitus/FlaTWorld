const path = require('path');
const webpack = require('webpack');

module.exports = [{
  entry: [
    './tests/manual/stressTest.es6.js'
  ],
  output: {
    path: path.join(__dirname, 'tests/dist'),
    filename: 'stressTest.es6.js',
  },
  devtool: 'eval-source-map',
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js?$/,
      exclude: [/node_modules/, /assets/],
      loader: 'eslint-loader',
      include: __dirname + '/src' ,
      options: {
        emitWarning: true
      }
    },{
      test: /\.handlebars$/,
      loader: "handlebars-loader"
    }]
  },
  devServer: {
    contentBase: path.join(__dirname, 'tests'),
    compress: true,
    port: 9000,
    hot: true,
    open: true,
  },
  mode: 'development',
}];