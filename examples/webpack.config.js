const path = require('path')
const webpack = require('webpack')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  entry: './index.js',
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'build'),
    clean: true
  },
  resolve: {
    fallback: {
      fs: false,
      child_process: false,
      worker_threads: false,
      net: false,
      tls: false,
      ws: false
    }
  },
  devServer: { static: { directory: __dirname }, open: true },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser')
    })
  ]
}
