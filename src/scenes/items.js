import xs from 'xstream'
import isolate from '@cycle/isolate'
import { div, section, h1 } from '@cycle/dom'
import Menu from '../components/menu'
import List from '../components/list'
import ModalDialog from '../components/modal'

function createNewList (id, sources) {
  return isolate(List)(sources, `list${id}`)
}

function createModal (sources, OpenModal) {
  return isolate(ModalDialog)({ ...sources, OpenModal }, 'modal1')
}

export default function Items (sources) {
  const list1 = createNewList(1, { ...sources, url: '/api/v1/items', category: 'items' })
  const list2 = createNewList(2, { ...sources, url: '/api/v1/items', category: 'items' })
  const modal = createModal(sources, xs.merge(list1.OpenModal, list2.OpenModal))
  const children$ = xs.combine(modal.DOM, list1.DOM, list2.DOM)

  const vtree$ = children$.map(([ modal, ...lists ]) =>
      div([
        Menu(sources),
        section('.items', [
          h1('Your items'),
          modal
        ]),
        ...lists
      ])
    )
  const request$ = xs.merge(list1.HTTP, list2.HTTP)

  return {
    DOM: vtree$,
    HTTP: request$,
    Router: sources.DOM.select('.menu-item')
      .events('click')
      .map(ev => ev.target.pathname)
  }
}
