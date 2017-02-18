var webpack = require('webpack');

module.exports = {
  entry: [
    './public/js/index.jsx'
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query:
      {
        plugins: ['transform-runtime'],
        presets:['react', 'es2015', 'stage-0']
      }
    }]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/public/js',
    publicPath: '/public',
    filename: 'bundle.js'
  }
};