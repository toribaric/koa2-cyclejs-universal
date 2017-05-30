import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { makeRouterDriver } from 'cyclic-router'
import { createBrowserHistory } from 'history'
import switchPath from 'switch-path'
import { preventDefaultDriver } from '../drivers/preventDefault'
import { initialStateDriver } from '../drivers/initialState'
import app from '../app'

import './css/main.global.css'

function main (sources) {
  return app(sources)
}

run(main, {
  DOM: makeDOMDriver('#app-container'),
  HTTP: makeHTTPDriver(),
  Router: makeRouterDriver(createBrowserHistory(), switchPath),
  InitialState: initialStateDriver,
  PreventDefault: preventDefaultDriver
})
