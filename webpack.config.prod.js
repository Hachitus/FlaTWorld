var path = require('path');
var webpack = require('webpack');

module.exports = [
  {
    entry: [
      './src/bundle'
    ],
    output: {
      path: `${path.resolve(__dirname)}/dist`,
      filename: 'flatworld.js',
      libraryTarget: 'commonjs',
      umdNamedDefine: true
    },
    devtool: 'source-map',
    node: {
      fs: "empty"
    },
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
      }]
    },
    mode: 'production',
    performance: {
      hints: true,
    },
  }, {
    entry: [
      './src/bundle'
    ],
    output: {
      path: `${path.resolve(__dirname)}/dist`,
      filename: 'flatworld.min.js',
      libraryTarget: 'var',
      library: 'flatworld',
      umdNamedDefine: true
    },
    node: {
      fs: "empty"
    },
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
      }]
    },
    mode: 'production',
    performance: {
      hints: true
    },
  }
];