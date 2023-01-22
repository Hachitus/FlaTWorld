const path = require('path');

module.exports = [{
  resolve: {
    fallback: {
      util: require.resolve("util/")
    }
  },
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
    static: path.join(__dirname, 'tests'),
    compress: true,
    port: 9000,
    hot: true,
    open: true,
  },
  mode: 'development',
}, {
  entry: [
    './src/bundle'
  ],
  output: {
    path: path.join(__dirname, 'tests/dist'),
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
      include: __dirname + '/src'
    },{
      test: /\.handlebars$/,
      loader: "handlebars-loader"
    }]
  },
  mode: 'development'
}];