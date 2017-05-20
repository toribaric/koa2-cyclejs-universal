import { run } from '@cycle/run'
import { makeHTMLDriver } from '@cycle/html'
import { makeHTTPDriver } from '@cycle/http'
import { makeRouterDriver } from 'cyclic-router'
import { createMemoryHistory } from 'history'
import switchPath from 'switch-path'
import app from './app'
import webpackUtils from './webpackUtils'

const IS_PROD: boolean = process.env.NODE_ENV !== 'development'

function createApp (appFn, url) {
  return function main (sources) {
    const app = appFn(sources)
    return {
      DOM: app.DOM,
      Router: app.Router.startWith(url)
    }
  }
}

export async function prepare (ctx: Object, next: () => void): Promise<void> {
  if (ctx.req.url === '/favicon.ico' || ctx.req.url.indexOf('api') > 0) {
    return next()
  }

  const main = createApp(app, ctx.req.url)
  run(main, {
    DOM: makeHTMLDriver(content => {
      ctx.state.content = content
    }),
    HTTP: makeHTTPDriver(),
    Router: makeRouterDriver(createMemoryHistory(), switchPath),
    PreventDefault: () => {}
  })

  return next()
}

export async function render (ctx: Object, next: () => void): Promise<void> {
  if (ctx.req.url === '/favicon.ico' || ctx.req.url.indexOf('api') > 0) {
    return next()
  }

  await ctx.render('index', {
    isProd: IS_PROD,
    content: ctx.state.content,
    ...webpackUtils.getChunksContextProps(IS_PROD)
  })
}
