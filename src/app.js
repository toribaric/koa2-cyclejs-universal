import routes from './routes'

export default function app (sources) {
  const match$ = sources.Router.define(routes)
  const page$ = match$.map(({path, value}) => {
    return value({
      ...sources,
      location: { path },
      Router: sources.Router.path(path)
    })
  })

  return {
    DOM: page$.map(c => c.DOM).flatten(),
    Router: page$.map(c => c.Router).flatten(),
    PreventDefault: sources.DOM.select('.menu-item').events('click')
  }
}
