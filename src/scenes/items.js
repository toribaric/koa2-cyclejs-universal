import xs from 'xstream'
import isolate from '@cycle/isolate'
import { div, section, h1, button } from '@cycle/dom'
import {
  getRequestWithState,
  getResponseWithState,
  INITIAL_STATE
} from '../drivers/initialState'
import Menu from '../components/menu'
import List from '../components/list'
import AddList from '../components/addList'
import ModalDialog from '../components/modal'
import {
  BASE_PATH,
  LISTS_PATH,
  ADD_LIST_PATH,
  ITEMS_PATH,
  OPEN_MODAL,
  ADD_LIST,
  LIST_ADDED
} from '../constants'

function getRequest (action$, state$, category) {
  const initial$ = getRequestWithState(state$, `${BASE_PATH}${LISTS_PATH}`, category)
  const mutation$ = action$.map(action => {
    if (action.type === ADD_LIST && action.payload) {
      return {
        url: `${BASE_PATH}${ADD_LIST_PATH}`,
        method: 'POST',
        send: { title: action.payload },
        category: 'add-list'
      }
    }

    return {}
  })

  return xs.merge(initial$, mutation$)
}

function getResponse (InitialState, HTTP, category) {
  return xs.merge(
    getResponseWithState(InitialState, HTTP, category),
    HTTP.select('add-list')
      .flatten()
      .map(res => ({ type: LIST_ADDED, payload: JSON.parse(res.text) }))
  )
}

function getListParams (sources, list) {
  const params = {
    ...sources,
    listId: list.id,
    listTitle: list.title,
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

export function createAddList (DOM, openModal$) {
  return isolate(AddList)({ DOM, OpenModal: openModal$ })
}

function intent (DOM, response$, { openModal$ }) {
  const action$ = DOM.select('.add-button').events('click')
    .mapTo({
      type: OPEN_MODAL,
      title: 'Add new list',
      component: createAddList(DOM, openModal$)
    })

  const addListAction$ = action$
    .filter(a => a.type === OPEN_MODAL)
    .map(x => x.component.AddList)
    .flatten()

  // must return a memory stream here as it has multiple
  // downstreams that sink to the DOM listener: first is
  // the state$ stream (model, state reducers), and second
  // is openModal$ which is a stream merged of this one and
  // of lists' OpenModal streams in order for the OPEN_MODAL
  // action to trigger modal dialogs for both adding new
  // items and new lists
  return xs
    .merge(action$, addListAction$, response$)
    .remember()
}

function model (sources, action$) {
  const initialStateReducer$ = action$
    .filter(a => a.type === INITIAL_STATE)
    .map(action => {
      return function initialStateReducer () {
        return action.payload.map(list => {
          const params = getListParams(sources, list)
          return createNewList(list.id, params)
        })
      }
    })

  const addListReducer$ = action$
    .filter(a => a.type === LIST_ADDED)
    .map(action => {
      return function addListReducer (lists) {
        if (action.payload.error) {
          return window.alert(`An error occurred while adding list: ${action.payload.error}`)
        }

        const params = getListParams(sources, action.payload.newList)
        const newList = createNewList(action.payload.newList.id, params)
        return lists.concat([newList])
      }
    })

  return xs.merge(initialStateReducer$, addListReducer$)
    .fold((lists, reducer) => reducer(lists), [])
}

function view (state$, modal, sources) {
  const buttons = div('.buttons', [
    button('.add-button', 'Add new list')
  ])
  return state$
    .map(lists => xs.combine(modal.DOM, ...lists.map(list => list.DOM)))
    .flatten()
    .map(([ modal, ...lists ]) => {
      return div([
        Menu(sources),
        section('.items', [
          div('.clearfix', [
            div('.pull-left', h1('Your items')),
            div('.pull-left', buttons)
          ]),
          modal
        ]),
        ...lists
      ])
    })
}

export default function Items (sources) {
  const proxy = {
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

  proxy.openModal$.imitate(openModal$)

  return {
    DOM: vtree$,
    HTTP: xs.merge(request$, listRequests$),
    Router: sources.DOM.select('.menu-item')
      .events('click')
      .map(ev => ev.target.pathname)
  }
}
