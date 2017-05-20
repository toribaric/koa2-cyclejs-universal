import xs from 'xstream'
import isolate from '@cycle/isolate'
import { div, section, h1 } from '@cycle/dom'
import Menu from '../components/menu'
import List from '../components/list'

function createNewList (id, sources) {
  return isolate(List)(sources, `list${id}`)
}

export default function Items (sources) {
  const list1$ = createNewList(1, { ...sources, url: '/api/v1/items', category: 'items' })
  const list2$ = createNewList(2, { ...sources, url: '/api/v1/items', category: 'items' })
  const vtree$ = xs.combine(list1$.DOM, list2$.DOM).map(([list1Vnode, list2Vnode]) =>
    div([
      Menu(sources),
      section('.items', [
        h1('Your items')
      ]),
      list1Vnode, list2Vnode
    ])
  )
  const request$ = xs.merge(list1$.HTTP, list2$.HTTP)

  return {
    DOM: vtree$,
    HTTP: request$,
    Router: sources.DOM.select('.menu-item')
      .events('click')
      .map(ev => ev.target.pathname)
  }
}
