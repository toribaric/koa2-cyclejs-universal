'use strict'

const path = require('path')
const publicPath = path.resolve(__dirname, './src/client')
const webpack = require('webpack')
const devPort = 9001

module.exports = {
  devtool: 'cheap-eval-source-map',
  performance: {
    hints: false
  },
  context: publicPath,
  entry: {
    app: [
      'babel-polyfill',
      'webpack-dev-server/client?http://localhost:' + devPort,
      'webpack/hot/only-dev-server',
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
      'xstream'
    ]
  },
  output: {
    path: path.join(publicPath, 'dist'),
    filename: '[name].js',
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
        exclude: /node_modules|dist/,
        loader: 'babel-loader'
      },
      {
        test: /\.global\.(css|scss)$/,
        loaders: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /^((?!\.global).)+\.(css|scss)$/,
        loaders: [
          'style-loader',
          'css-loader?modules&context=./src/&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
          'postcss-loader'
        ]
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
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }),
    new webpack.DefinePlugin({
      __DEV__: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
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
  ],
  devServer: {
    contentBase: path.join(publicPath, 'dist'),
    hot: true
  }
}
