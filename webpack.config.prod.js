'use strict'

const path = require('path')
const publicPath = path.resolve(__dirname, './src/client')
const buildPath = path.resolve(__dirname, './build/client')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const ChunkManifestPlugin = require('chunk-manifest-webpack2-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  context: publicPath,
  entry: {
    app: [
      'babel-polyfill',
      './index.js'
    ],
    vendor: [
      '@cycle/dom',
      '@cycle/html',
      '@cycle/run',
      '@cycle/http',
      'cyclic-router',
      'history',
      'switch-path',
      'xstream',
      'snabbdom-selector'
    ]
  },
  output: {
    path: path.join(buildPath, 'dist'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      './src/client',
      './src/components',
      './src/scenes',
      './src/app.js',
      './src/routes.js',
      'node_modules'
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?![^/]+?\/(src|es6|es|lib\/es))|dist/,
        loader: 'babel-loader',
        query: {
          babelrc: false,
          presets: [
            ['es2015', { 'modules': false }],
            'stage-0'
          ],
          plugins: ['transform-runtime']
        }
      },
      {
        test: /\.global\.(css|scss)$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader']
        })
      },
      {
        test: /^((?!\.global).)+\.(css|scss)$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          publicPath: buildPath,
          use: [
            'css-loader?modules&context=./src/&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
            'postcss-loader'
          ]
        })
      },
      {
        test: /\.(gif|png|jpg)$/,
        loader: 'url-loader',
        query: {
          url: 'limit=25000'
        }
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?.+)?$/,
        loader: 'url-loader',
        query: {
          url: 'limit=100000'
        }
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'style.[chunkhash].css',
      disable: false,
      allChunks: true
    }),
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }),
    new WebpackMd5Hash(),
    new ManifestPlugin(),
    new ChunkManifestPlugin({
      filename: 'chunk-manifest.json',
      manifestVariable: 'webpackManifest'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
      options: {
        postcss () {
          return [
            require('postcss-apply'),
            require('precss'),
            require('autoprefixer')
          ]
        }
      }
    })
  ]
}
