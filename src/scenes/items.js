import xs from 'xstream'
import isolate from '@cycle/isolate'
import { div, section, h1 } from '@cycle/dom'
import {
  getRequestWithState,
  getResponseWithState,
  INITIAL_STATE
} from '../drivers/initialState'
import Menu from '../components/menu'
import List from '../components/list'
import ModalDialog from '../components/modal'
import { BASE_PATH, LISTS_PATH, ITEMS_PATH } from '../constants'

function getListParams (sources, list) {
  const params = {
    ...sources,
    listId: list.id,
    url: `${BASE_PATH}${ITEMS_PATH}`.replace(':listId', list.id),
    category: 'listItems'
  }

  if (list.items) {
    return { ...params, initialState: list.items }
  }

  return params
}

function createNewList (id, params) {
  return isolate(List)(params, `list${id}`)
}

function createModal (sources, OpenModal) {
  return isolate(ModalDialog)({ ...sources, OpenModal }, 'modal1')
}

function model (sources, response$) {
  const initialStateReducer$ = response$
    .filter(a => a.type === INITIAL_STATE)
    .map(action => {
      return function initialStateReducer () {
        return action.payload.map(list => {
          const params = getListParams(sources, list)
          return createNewList(list.id, params)
        })
      }
    })

  return initialStateReducer$
    .fold((lists, reducer) => reducer(lists), [])
}

function view (state$, sources) {
  const openModal$ = state$
    .map(lists => xs.merge(...lists.map(list => list.OpenModal)))
    .flatten()
  const modal = createModal(sources, openModal$)
  return state$
    .map(lists => xs.combine(modal.DOM, ...lists.map(list => list.DOM)))
    .flatten()
    .map(([ modal, ...lists ]) => {
      return div([
        Menu(sources),
        section('.items', [
          h1('Your items'),
          modal
        ]),
        ...lists
      ])
    })
}

export default function Items (sources) {
  const response$ = getResponseWithState(sources.InitialState, sources.HTTP, 'items')
  const state$ = model(sources, response$)
  const vtree$ = view(state$, sources)
  const request$ = getRequestWithState(state$, `${BASE_PATH}${LISTS_PATH}`, 'items')
  const listRequests$ = state$
    .map(lists => xs.merge(...lists.map(list => list.HTTP)))
    .flatten()

  return {
    DOM: vtree$,
    HTTP: xs.merge(request$, listRequests$),
    Router: sources.DOM.select('.menu-item')
      .events('click')
      .map(ev => ev.target.pathname)
  }
}
