import xs from 'xstream'
import { div, section, h1, p } from '@cycle/dom'
import Menu from '../components/menu'

export default function About (sources) {
  const vnode = (
    div([
      Menu(sources),
      section('.about', [
        h1('Read more about us'),
        p('This is the page where we describe ourselves.'),
        p('Contact us')
      ])
    ])
  )

  return {
    DOM: xs.of(vnode),
    HTTP: xs.empty(),
    Router: sources.DOM.select('.menu-item')
      .events('click')
      .map(ev => ev.target.pathname)
  }
}
