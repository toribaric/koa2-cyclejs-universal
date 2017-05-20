import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { makeRouterDriver } from 'cyclic-router'
import { createBrowserHistory } from 'history'
import switchPath from 'switch-path'
import app from '../app'

import './css/main.global.css'

function main (sources) {
  return app(sources)
}

function preventDefaultDriver (ev$) {
  ev$.addListener({
    next: ev => ev.preventDefault()
  })
}

run(main, {
  DOM: makeDOMDriver('#app-container'),
  HTTP: makeHTTPDriver(),
  Router: makeRouterDriver(createBrowserHistory(), switchPath),
  PreventDefault: preventDefaultDriver
})
