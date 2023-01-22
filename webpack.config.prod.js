var path = require('path');

module.exports = [
  {
    entry: [
      './src/bundle'
    ],
    output: {
      path: `${path.resolve(__dirname)}/dist`,
      filename: 'flatworld.js',
      library: 'FTW',
      libraryTarget: 'umd',
    },
    devtool: 'source-map',
    resolve: {
      fallback: {
        fs: false
      }
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
      hints: 'warning',
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
    resolve: {
      fallback: {
        fs: false
      }
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
      hints: 'warning'
    },
  }
];