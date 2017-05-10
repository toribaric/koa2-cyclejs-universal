/* @flow */

import Koa from 'koa'
import convert from 'koa-convert'
import proxy from 'koa-proxy'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import webpackConfig from '../webpack.config'

function runDevServer (app: Koa) {
  const devServerPort: number = 9001
  const compiler: () => any = webpack(webpackConfig)

  const webpackDevServer: (
    compiler: () => void,
    options: Object
  ) => any = new WebpackDevServer(compiler, {
    contentBase: '/src/client/',
    publicPath: '/dist/',
    stats: {
      colors: true,
      chunks: false
    }
  })

  webpackDevServer.listen(devServerPort, () => {
    console.log(`Webpack dev server now running on http://localhost:${devServerPort}`)
  })

  // Webpack related assets - proxy to dev server
  app.use(convert(proxy({
    host: `http://127.0.0.1:${devServerPort}`,
    match: /^\/dist\//
  })))
}

function getChunksContextProps (isProd: boolean) {
  if (isProd) {
    const webpackManifest: Object = require('./client/dist/manifest.json')
    const webpackChunkManifest: Object = require('./client/dist/chunk-manifest.json')
    return {
      webpack: {
        app: webpackManifest[ 'app.js' ],
        vendor: webpackManifest[ 'vendor.js' ],
        style: webpackManifest[ 'app.css' ],
        webpackChunkManifest: JSON.stringify(webpackChunkManifest)
      }
    }
  } else {
    return {
      webpack: {
        app: 'app.js',
        vendor: 'vendor.js'
      }
    }
  }
}

export default {
  runDevServer,
  getChunksContextProps
}
