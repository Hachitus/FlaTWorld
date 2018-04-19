var path = require('path');
var webpack = require('webpack');

module.exports = [{
    entry: [
      './src/bundle'
    ],
    output: {
      path: `${path.resolve(__dirname)}/dist`,
      filename: 'flatworld.js',
      libraryTarget: 'umd',
      library: 'flatworld',
      umdNamedDefine: true
    },
    node: {
      fs: "empty"
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
    mode: 'production'
  }, {
    entry: [
      './src/bundle'
    ],
    output: {
      path: `${path.resolve(__dirname)}/dist`,
      filename: 'flatworld.var.js',
      libraryTarget: 'var',
      library: 'flatworld',
      umdNamedDefine: true
    },
    node: {
      fs: "empty"
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
    mode: 'production'
}];