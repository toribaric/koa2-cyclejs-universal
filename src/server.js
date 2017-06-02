/* @flow */

import 'css-modules-require-hook/preset'
import 'babel-polyfill'
import path from 'path'
import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import Router from 'koa-router'
import serve from 'koa-static'
import convert from 'koa-convert'
import koaNunjucks from 'koa-nunjucks-2'
import setupApiRoutes from './api'
import webpackUtils from './webpackUtils'
import { prepare, render } from './render'
import { BASE_PATH } from './constants'

const APP_PORT: number = 3000
const IS_PROD: boolean = process.env.NODE_ENV !== 'development'

const koa: Koa = new Koa()
const router: Router = new Router({ prefix: BASE_PATH })

setupApiRoutes(router)

koa.keys = ['!s3cr3t:']

koa.use((ctx, next) => {
  ctx.request.header.authorization = 'Bearer xxx'
  return next()
})

koa.use(koaBody())

koa.use(koaNunjucks({
  ext: 'html',
  path: path.join(__dirname, 'views'),
  writeResponse: true,
  nunjucksConfig: {
    autoescape: true
  }
}))

// if dev env, start webpack dev server, which also starts a proxy for all /dist/
// requests to it.
if (!IS_PROD) {
  webpackUtils.runDevServer(koa)
}

koa.use(router.routes())
koa.use(router.allowedMethods())
koa.use(convert(serve(path.resolve(__dirname, './client'))))
koa.use(prepare)
koa.use(render)

koa.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`)
})
