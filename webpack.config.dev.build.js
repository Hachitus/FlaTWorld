const path = require('path');
const webpack = require('webpack');

module.exports = [{
  entry: [
    './src/bundle'
  ],
  output: {
    path: `${path.resolve(__dirname)}/tests/dist`,
    filename: 'flatworld.js',
    libraryTarget: 'commonjs',
    umdNamedDefine: true
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
  mode: 'development',
  performance: {
    hints: false
  },
}];