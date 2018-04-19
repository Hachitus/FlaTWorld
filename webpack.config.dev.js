var path = require('path');
var webpack = require('webpack');

module.exports = [{
  entry: [
    './tests/manual/stressTest.es6.js'
  ],
  output: {
    path: path.join(__dirname, 'tests/dist'),
    filename: 'stressTest.es6.js',
    libraryTarget: 'var',
    library: 'stressTest',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js?$/,
      exclude: [/node_modules/, /assets/],
      loader: 'eslint-loader',
      include: __dirname + '/src' 
    },{
      test: /\.handlebars$/,
      loader: "handlebars-loader"
    },
    {
      test: /\.js?$/,
      loader: 'bundle-loader',          
      options: {
        name: 'my-chunk'
      }
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