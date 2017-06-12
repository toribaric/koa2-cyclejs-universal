import xs from 'xstream'
import isolate from '@cycle/isolate'
import intent from './intent'
import model from './model'
import view from './view'
import { getRequest, getResponse } from './data'
import ModalDialog from '../../components/modal'
import {
  OPEN_MODAL
} from '../../constants'

function createModal (sources, OpenModal) {
  return isolate(ModalDialog)({ ...sources, OpenModal }, 'modal1')
}

export default function Items (sources) {
  const proxy = {
    listRemove$: xs.create(),
    openModal$: xs.create()
  }

  const modal = createModal(sources, proxy.openModal$)
  const response$ = getResponse(sources.InitialState, sources.HTTP, 'items')
  const action$ = intent(sources.DOM, response$, proxy)
  const state$ = model(sources, action$)
  const vtree$ = view(state$, modal, sources)
  const request$ = getRequest(action$, state$, 'items')
  const listRequests$ = state$
    .map(lists => xs.merge(...lists.map(list => list.HTTP)))
    .flatten()
  const openModal$ = xs.merge(
    action$.filter(a => a.type === OPEN_MODAL),
    state$
      .map(lists => xs.merge(...lists.map(list => list.OpenModal)))
      .flatten()
  )
  const listRemove$ = state$
    .map(lists => xs.merge(...lists.map(list => list.Remove)))
    .flatten()

  proxy.openModal$.imitate(openModal$)
  proxy.listRemove$.imitate(listRemove$)

  return {
    DOM: vtree$,
    HTTP: xs.merge(request$, listRequests$),
    Router: sources.DOM.select('.menu-item')
      .events('click')
      .map(ev => ev.target.pathname)
  }
}
