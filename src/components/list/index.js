import xs from 'xstream'
import intent from './intent'
import model from './model'
import view from './view'
import { getRequest, getResponse } from './data'
import {
  OPEN_MODAL
} from '../../constants'

export default function List (sources) {
  const proxy = {
    itemRemove$: xs.create(),
    itemDuplicate$: xs.create(),
    openModal$: xs.create()
  }
  const response$ = getResponse(sources)
  const action$ = intent(sources.DOM, response$, proxy)
  const state$ = model(sources.DOM, action$)
  const vtree$ = view(state$, sources.DOM, sources.listId)
  const request = getRequest(action$, sources)
  const itemRemove$ = state$.map(items =>
    xs.merge(...items.map(item => item.Remove))
  ).flatten()
  const itemDuplicate$ = state$.map(items =>
    xs.merge(...items.map(item => item.Duplicate))
  ).flatten()
  const openModal$ = action$.filter(action => action.type === OPEN_MODAL)

  proxy.itemRemove$.imitate(itemRemove$)
  proxy.itemDuplicate$.imitate(itemDuplicate$)
  proxy.openModal$.imitate(openModal$)

  return {
    DOM: vtree$,
    HTTP: request,
    OpenModal: openModal$
  }
}
