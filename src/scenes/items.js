import xs from 'xstream'
import isolate from '@cycle/isolate'
import { div, section, h1 } from '@cycle/dom'
import Menu from '../components/menu'
import List from '../components/list'

export default function Items (sources) {
  const list1$ = isolate(List)(sources, 'list1')
  const list2$ = isolate(List)(sources, 'list2')
  const vtree$ = xs.combine(list1$.DOM, list2$.DOM).map(([list1Vnode, list2Vnode]) =>
    div([
      Menu(sources),
      section('.items', [
        h1('Your items')
      ]),
      list1Vnode, list2Vnode
    ])
  )

  return {
    DOM: vtree$,
    Router: sources.DOM.select('.menu-item')
      .events('click')
      .map(ev => ev.target.pathname)
  }
}
