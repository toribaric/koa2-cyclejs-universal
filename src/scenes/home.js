import xs from 'xstream'
import { div, section, h1, p } from '@cycle/dom'
import Menu from '../components/menu'

export default function Home (sources) {
  const vnode = (
    div([
      Menu(sources),
      section('.home', [
        h1('The homepage'),
        p('Welcome to our spectacular web page with nothing special here.'),
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
